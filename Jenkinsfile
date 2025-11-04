// Jenkinsfile - Declarative Pipeline cho Next.js (Front-end) và Node/TS (Back-end)
pipeline {
    // SỬ DỤNG agent any Ở CẤP ĐỘ PIPELINE
    agent any

    // Định nghĩa các biến môi trường
    environment {
        // Tên thư mục của Front-end và Back-end
        FRONTEND_DIR = 'front-end'
        BACKEND_DIR  = 'back-end'
        // Tên image Docker cuối cùng để push (ví dụ)
        DOCKER_IMAGE_NAME = "pet-store"
        // Bạn cần thay thế địa chỉ này bằng Registry của bạn (Docker Hub, ECR,...)
        DOCKER_REGISTRY = "your-docker-registry.com" 
        // Thêm biến cho Docker credentials ID nếu bạn sử dụng credentials trong Jenkins
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials' 
    }

    stages {
        
        // Stage 1: Checkout Code
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code from SCM...'
            }
        }

        // --- Back-end (Node.js/TypeScript) Stages ---
        // Sử dụng Docker Agent (node:20-slim) cho các bước build/test
        
        stage('Backend: Install Dependencies & Build') {
            agent {
                docker {
                    image 'node:20-slim' // Agent có sẵn Node.js
                    args '-u root:root'
                }
            }
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Installing backend dependencies...'
                    sh 'npm ci'
                    
                    echo 'Building backend TypeScript project...'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Backend: Test & Lint') {
            agent {
                docker {
                    image 'node:20-slim' // Agent có sẵn Node.js
                    args '-u root:root'
                }
            }
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Running backend linting...'
                    sh 'npm run lint'
                    
                    echo 'Running backend tests...'
                    // Hiện tại chỉ là echo. Thay thế bằng lệnh test thực tế khi bạn có.
                    sh 'npm test' 
                }
            }
        }


        // --- Front-end (Next.js) Docker Stages ---

        stage('Frontend: Docker Build') {
            // Cần Docker CLI, nên dùng agent any và yêu cầu Docker phải được cài trên Host
            agent any
            steps {
                echo 'Building Next.js Docker image...'
                script {
                    // Lệnh sh yêu cầu Docker CLI phải có trong PATH của Jenkins user
                    sh "docker build -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend ./${FRONTEND_DIR}"
                }
            }
        }

        // --- Deployment/Push (Tùy chọn) ---
        
        stage('Push Docker Image') {
            when { expression { return currentBuild.result == 'SUCCESS' } }
            agent any
            steps {
                echo 'Pushing Docker image to registry...'
                script {
                    // Dùng withCredentials để đăng nhập Docker
                    /*
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin ${DOCKER_REGISTRY}"
                    }
                    */
                    
                    // Push image
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend"
                    sh "docker tag ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest-frontend"
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest-frontend"
                }
            }
        }
    }

    // Các hành động sau khi Pipeline hoàn thành
    post {
        always {
            echo 'Pipeline finished.'
            // Bỏ qua lỗi junit nếu không có file test report
            script {
                try {
                    junit '**/test-results/*.xml' 
                } catch (e) {
                    echo "JUnit report skipped: No test files found."
                }
            }
        }
        success {
            echo 'Build, Test, and Docker Build successful.'
        }
        failure {
            echo 'Pipeline failed. Please review the logs.'
        }
        cleanup {
            // Xóa image local sau khi push (yêu cầu Docker CLI trên Host)
            script {
                try {
                    sh "docker rmi ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend"
                } catch (e) {
                    echo "Could not remove image locally: script returned exit code 127 (docker not found)."
                }
            }
        }
    }
}

