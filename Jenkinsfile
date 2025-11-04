pipeline {
    // Sử dụng agent any cho toàn bộ pipeline để chạy các lệnh Docker CLI/Compose trên Agent Host (Ubuntu)
    agent any

    environment {
        // --- CẤU HÌNH DỰ ÁN ---
        FRONTEND_DIR = 'front-end'
        BACKEND_DIR  = 'back-end'
        // Tên image Docker Hub cá nhân (Ví dụ: luonghailam/pet-store)
        DOCKER_IMAGE_NAME = "luonghailam/pet-store" 

        // --- CẤU HÌNH DOCKER/JENKINS ---
        // Địa chỉ Docker Hub
        DOCKER_REGISTRY = "docker.io" 
        // ID Credentials trong Jenkins (Đã xác nhận là 'dockerhub-cred')
        DOCKER_CREDENTIALS_ID = 'dockerhub-cred' 
        
        // --- CẤU HÌNH PORT HOST ---
        FRONTEND_HOST_PORT = '8082' // ĐÃ SỬA: Chạy trên Host Port 8082 để tránh 8080 (Jenkins)
        BACKEND_HOST_PORT = '3001' // ĐÃ SỬA: Chạy trên Host Port 3001

        // Tên image hoàn chỉnh cho Deployment
        FRONTEND_FULL_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest-frontend"
        BACKEND_FULL_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest-backend"
        
        // Tên image dùng cho Build (gắn với BUILD_NUMBER)
        FRONTEND_BUILD_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend"
        BACKEND_BUILD_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-backend"
    }

    stages {
        
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code from SCM...'
            }
        }

        stage('Backend: Install Dependencies & Build') {
            agent {
                docker { image 'node:20-slim'; args '-u root:root' }
            }
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Installing backend dependencies...'
                    sh 'npm ci'
                    
                    echo 'Building backend TypeScript project...'
                    sh 'npm run build' // Sử dụng tsc
                }
            }
        }
        
        stage('Backend: Test & Lint') {
            agent {
                docker { image 'node:20-slim'; args '-u root:root' }
            }
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Running backend linting...'
                    sh 'npm run lint'
                    
                    echo 'Running backend tests...'
                    sh 'npm test' 
                }
            }
        }

        stage('Frontend: Docker Build') {
            agent any
            steps {
                echo 'Building Next.js Docker image...'
                script {
                    sh "docker build -t ${FRONTEND_BUILD_IMAGE} ./${FRONTEND_DIR}"
                    sh "docker tag ${FRONTEND_BUILD_IMAGE} ${FRONTEND_FULL_IMAGE}"
                }
            }
        }
        
        stage('Backend: Docker Build') {
            agent any
            steps {
                echo 'Building Backend Docker image...'
                script {
                    sh "docker build -t ${BACKEND_BUILD_IMAGE} ./${BACKEND_DIR}"
                    sh "docker tag ${BACKEND_BUILD_IMAGE} ${BACKEND_FULL_IMAGE}"
                }
            }
        }

        stage('Push Docker Images') {
            when { expression { return currentBuild.result == null || currentBuild.result == 'SUCCESS' } } 
            agent any
            steps {
                echo 'Pushing Docker images to registry...'
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin ${DOCKER_REGISTRY}"
                    }
                    
                    sh "docker push ${FRONTEND_FULL_IMAGE}"
                    sh "docker push ${BACKEND_FULL_IMAGE}"
                    
                    sh "docker push ${FRONTEND_BUILD_IMAGE}"
                    sh "docker push ${BACKEND_BUILD_IMAGE}"

                    sh "docker logout ${DOCKER_REGISTRY}"
                }
            }
        }

        stage('Deploy to Staging') {
            agent any
            steps {
                echo 'Deploying application using docker-compose...'
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin ${DOCKER_REGISTRY}"

                        sh "docker pull ${FRONTEND_FULL_IMAGE}"
                        sh "docker pull ${BACKEND_FULL_IMAGE}"

                        sh "docker logout ${DOCKER_REGISTRY}"
                    }
                    
                    // Sử dụng lệnh 'docker compose' (không dấu gạch ngang)
                    sh "docker compose -f docker-compose.yml down --remove-orphans"
                    sh "docker compose -f docker-compose.yml up -d"

                    echo "Deployment completed. Waiting for services to start..."
                }
            }
        }
        
        stage('Health Check') {
            agent any
            steps {
                echo 'Running service health checks...'
                // ⭐️ ĐÃ SỬA: Tăng thời gian chờ lên 60 giây
                sh 'sleep 60' 

                // Kiểm tra Backend trước (vì Frontend phụ thuộc Backend)
                sh "curl -f http://localhost:${BACKEND_HOST_PORT}/api/health || exit 1" 

                // Kiểm tra Frontend trên Host Port 8082
                sh "curl -f http://localhost:${FRONTEND_HOST_PORT} || exit 1"
                
                echo 'All services are healthy and running!'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
            script {
                try {
                    // Ghi lại kết quả test
                    junit '**/test-results/*.xml' 
                } catch (e) {
                    echo "JUnit report skipped: No test files found."
                }
            }
        }
        success {
            echo 'Build, Test, Push, and Deploy successful!'
        }
        failure {
            echo 'Pipeline failed. Please review the logs.'
        }
        cleanup {
            // Xóa image local đã tag bằng BUILD_NUMBER sau khi dùng
            script {
                try {
                    sh "docker rmi ${FRONTEND_BUILD_IMAGE}"
                    sh "docker rmi ${BACKEND_BUILD_IMAGE}"
                } catch (e) {
                    echo "Could not remove one or more build images locally."
                }
            }
        }
    }
}

