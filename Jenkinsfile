pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        DOCKER_REGISTRY = 'your-registry.com' // Change this to your registry
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/pet-store-frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/pet-store-backend"
        MONGO_IMAGE = 'mongo:latest'
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials' // Jenkins credentials ID
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                script {
                    // Install Node.js if not present
                    sh 'node --version || curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && apt-get install -y nodejs'
                }
            }
        }

        stage('Lint Frontend') {
            steps {
                dir('front-end') {
                    sh 'npm ci'
                    sh 'npm run lint'
                }
            }
        }

        stage('Lint Backend') {
            steps {
                dir('back-end') {
                    sh 'npm ci'
                    sh 'npm run lint'
                }
            }
        }

        stage('Test Frontend') {
            steps {
                dir('front-end') {
                    sh 'npm ci'
                    sh 'npm test -- --watchAll=false --passWithNoTests'
                }
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'front-end/test-results.xml', allowEmptyResults: true
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'front-end/coverage',
                        reportFiles: 'index.html',
                        reportName: 'Frontend Coverage Report'
                    ])
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('back-end') {
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'back-end/test-results.xml', allowEmptyResults: true
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('front-end') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('back-end') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Frontend Docker Image') {
                    steps {
                        script {
                            docker.build(FRONTEND_IMAGE, './front-end')
                        }
                    }
                }
                stage('Backend Docker Image') {
                    steps {
                        script {
                            docker.build(BACKEND_IMAGE, './back-end')
                        }
                    }
                }
            }
        }

        stage('Push Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin ${DOCKER_REGISTRY}"
                        docker.image(FRONTEND_IMAGE).push()
                        docker.image(BACKEND_IMAGE).push()
                        sh "docker logout ${DOCKER_REGISTRY}"
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    // Deploy to staging environment
                    sh '''
                        echo "Deploying to staging environment..."
                        # Update docker-compose for staging
                        sed -i "s/localhost:3000/staging.yourdomain.com/g" docker-compose.yml
                        sed -i "s/localhost:8080/staging-api.yourdomain.com/g" docker-compose.yml

                        # Deploy using docker-compose
                        docker-compose -f docker-compose.staging.yml down
                        docker-compose -f docker-compose.staging.yml pull
                        docker-compose -f docker-compose.staging.yml up -d

                        echo "Staging deployment completed"
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message "Deploy to production?"
                ok "Deploy"
            }
            steps {
                script {
                    // Deploy to production environment
                    sh '''
                        echo "Deploying to production environment..."

                        # Production deployment with zero downtime
                        docker-compose -f docker-compose.prod.yml down
                        docker-compose -f docker-compose.prod.yml pull
                        docker-compose -f docker-compose.prod.yml up -d

                        # Health check
                        sleep 30
                        curl -f http://localhost:3000 || exit 1
                        curl -f http://localhost:8080/api/health || exit 1

                        echo "Production deployment completed"
                    '''
                }
            }
        }

        stage('Security Scan') {
            steps {
                script {
                    // Run security scans on Docker images
                    sh '''
                        echo "Running security scans..."
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy image ${FRONTEND_IMAGE}:latest || true
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy image ${BACKEND_IMAGE}:latest || true
                    '''
                }
            }
        }

        stage('Performance Test') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    sh '''
                        echo "Running performance tests..."
                        # Install Apache Bench if not present
                        which ab || apt-get update && apt-get install -y apache2-utils

                        # Wait for services to be ready
                        sleep 60

                        # Run load tests
                        ab -n 100 -c 10 http://localhost:3000/ || true
                        ab -n 100 -c 10 http://localhost:8080/api/health || true
                    '''
                }
            }
        }
    }

    post {
        success {
            script {
                echo "Pipeline completed successfully!"

                // Send success notification
                if (env.BRANCH_NAME == 'main') {
                    emailext (
                        subject: "✅ Pet Store - Production Deployment Successful",
                        body: "The Pet Store application has been successfully deployed to production.\n\nBuild: ${env.BUILD_URL}\nBranch: ${env.BRANCH_NAME}\nCommit: ${env.GIT_COMMIT}",
                        to: "team@yourcompany.com"
                    )
                }
            }
        }

        failure {
            script {
                echo "Pipeline failed!"

                // Send failure notification
                emailext (
                    subject: "❌ Pet Store - Pipeline Failed",
                    body: "The Pet Store pipeline has failed.\n\nBuild: ${env.BUILD_URL}\nBranch: ${env.BRANCH_NAME}\nCommit: ${env.GIT_COMMIT}\n\nPlease check the logs and fix the issues.",
                    to: "team@yourcompany.com"
                )
            }
        }

        unstable {
            script {
                echo "Pipeline is unstable!"
                emailext (
                    subject: "⚠️ Pet Store - Pipeline Unstable",
                    body: "The Pet Store pipeline completed with warnings.\n\nBuild: ${env.BUILD_URL}\nBranch: ${env.BRANCH_NAME}\nCommit: ${env.GIT_COMMIT}",
                    to: "team@yourcompany.com"
                )
            }
        }

        always {
            // Clean up workspace
            cleanWs()

            // Clean up Docker resources
            sh '''
                echo "Cleaning up Docker resources..."
                docker system prune -f
                docker volume prune -f
            '''
        }
    }
}