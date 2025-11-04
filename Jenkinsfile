pipeline {
    // Sử dụng agent any cho toàn bộ pipeline để chạy các lệnh Docker CLI/Compose trên Agent Host (Ubuntu)
    agent any

    environment {
        // --- CẤU HÌNH DỰ ÁN ---
        FRONTEND_DIR = 'front-end'
        BACKEND_DIR  = 'back-end'
        // ĐÃ CHỈNH SỬA: Thêm tên người dùng Docker Hub của bạn (luonghailam/) vào tên image
        DOCKER_IMAGE_NAME = "luonghailam/pet-store" 

        // --- CẤU HÌNH DOCKER/JENKINS (ĐÃ CHÍNH XÁC) ---
        // Địa chỉ Docker Hub
        DOCKER_REGISTRY = "docker.io" 
        // ID Credentials trong Jenkins (đã xác nhận là 'docker-hub-cred')
        DOCKER_CREDENTIALS_ID = 'docker-hub-cred' 

        // Tên image hoàn chỉnh cho Deployment (luonghailam/pet-store:latest-frontend)
        FRONTEND_FULL_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest-frontend"
        BACKEND_FULL_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest-backend"
        
        // Cần dùng BUILD_NUMBER cho tag duy nhất
        FRONTEND_BUILD_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend"
        BACKEND_BUILD_IMAGE = "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-backend"
    }

    stages {
        
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code from SCM...'
                // Không cần checkout scm ở đây vì nó đã được Jenkins tự động làm ở đầu job
            }
        }

        stage('Backend: Install Dependencies & Build') {
            agent {
                // Chạy các bước Node.js bên trong container sạch
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
            // Chạy trên Agent Host vì lệnh 'docker build' cần truy cập Docker Daemon
            agent any
            steps {
                echo 'Building Next.js Docker image...'
                script {
                    // 1. Build image với tag BUILD_NUMBER
                    sh "docker build -t ${FRONTEND_BUILD_IMAGE} ./${FRONTEND_DIR}"
                    // 2. Tag image 'latest' để sử dụng cho Deployment
                    sh "docker tag ${FRONTEND_BUILD_IMAGE} ${FRONTEND_FULL_IMAGE}"
                }
            }
        }
        
        stage('Backend: Docker Build') {
            // 🚨 BẮT BUỘC: Bạn phải có Dockerfile trong back-end/
            agent any
            steps {
                echo 'Building Backend Docker image...'
                script {
                    // 1. Build image với tag BUILD_NUMBER
                    sh "docker build -t ${BACKEND_BUILD_IMAGE} ./${BACKEND_DIR}"
                    // 2. Tag image 'latest' để sử dụng cho Deployment
                    sh "docker tag ${BACKEND_BUILD_IMAGE} ${BACKEND_FULL_IMAGE}"
                }
            }
        }

        stage('Push Docker Images') {
            // Stage quan trọng: Đẩy image lên Docker Hub
            when { expression { return currentBuild.result == 'SUCCESS' } } 
            agent any
            steps {
                echo 'Pushing Docker images to registry...'
                script {
                    // Đăng nhập Docker Hub sử dụng Credentials ID của Jenkins
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin ${DOCKER_REGISTRY}"
                    }
                    
                    // Push image Frontend (latest)
                    sh "docker push ${FRONTEND_FULL_IMAGE}"
                    // Push image Backend (latest)
                    sh "docker push ${BACKEND_FULL_IMAGE}"
                    
                    // Đẩy các tag BUILD_NUMBER cho mục đích rollback
                    sh "docker push ${FRONTEND_BUILD_IMAGE}"
                    sh "docker push ${BACKEND_BUILD_IMAGE}"

                    sh "docker logout ${DOCKER_REGISTRY}"
                }
            }
        }

        stage('Deploy to Staging') {
            // Cần Docker Compose CLI trên Agent Host
            agent any
            steps {
                echo 'Deploying application using docker-compose...'
                script {
                    // ĐÃ CHỈNH SỬA: Đăng nhập Docker Hub để kéo image từ repository cá nhân
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin ${DOCKER_REGISTRY}"

                        // Tải image mới nhất đã được push 
                        sh "docker pull ${FRONTEND_FULL_IMAGE}"
                        sh "docker pull ${BACKEND_FULL_IMAGE}"

                        // Đăng xuất ngay sau khi pull xong
                        sh "docker logout ${DOCKER_REGISTRY}"
                    }
                    
                    // Sử dụng docker-compose.yml trong thư mục gốc
                    // down --remove-orphans: Xóa container cũ
                    // up -d: Khởi động services mới
                    sh "docker-compose -f docker-compose.yml down --remove-orphans"
                    sh "docker-compose -f docker-compose.yml up -d"

                    echo "Deployment completed. Waiting for services to start..."
                }
            }
        }
        
        stage('Health Check') {
            // Kiểm tra tình trạng ứng dụng sau khi deploy
            agent any
            steps {
                echo 'Running service health checks...'
                // Chờ một chút để các services khởi động
                sh 'sleep 30' 

                // Kiểm tra Frontend (Port 3000)
                sh 'curl -f http://localhost:3000 || exit 1'
                
                // Kiểm tra Backend (Port 8080)
                sh 'curl -f http://localhost:8080/api/health || exit 1' 
                
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

