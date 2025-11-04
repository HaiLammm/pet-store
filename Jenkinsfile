pipeline {
    agent any

    environment {
        // Tên thư mục của Front-end và Back-end
        FRONTEND_DIR = 'front-end'
        BACKEND_DIR  = 'back-end'
        // Tên image Docker cuối cùng để push (ví dụ)
        DOCKER_IMAGE_NAME = "pet-store"
        // 🚨 ĐÃ CẬP NHẬT: Địa chỉ Docker Hub
        DOCKER_REGISTRY = "docker.io" 
        // 🚨 ĐÃ CẬP NHẬT: ID Credentials khớp với Jenkins
        DOCKER_CREDENTIALS_ID = 'docker-hub-cred' 
    }

    stages {
        
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code from SCM...'
            }
        }

        stage('Backend: Install Dependencies & Build') {
            agent {
                docker {
                    image 'node:20-slim'
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
                    image 'node:20-slim'
                    args '-u root:root'
                }
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
            // Cần Docker CLI trên Agent Host
            agent any
            steps {
                echo 'Building Next.js Docker image...'
                script {
                    sh "docker build -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend ./${FRONTEND_DIR}"
                }
            }
        }

        // BƯỚC SỬA LỖI: Đảm bảo Stage Push luôn chạy và thực hiện Login
        stage('Push Docker Image') {
            // Tạm thời luôn chạy sau khi build thành công
            when { expression { return currentBuild.result == 'SUCCESS' } } 
            agent any
            steps {
                echo 'Pushing Docker image to registry...'
                script {
                    // Cú pháp chuẩn để đăng nhập Docker bằng Credentials ID của Jenkins
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin ${DOCKER_REGISTRY}"
                    }
                    
                    // Push image theo BUILD_NUMBER
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend"
                    
                    // Tag và Push image 'latest'
                    sh "docker tag ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest-frontend"
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest-frontend"

                    // Logout Docker Registry (Tùy chọn)
                    sh "docker logout ${DOCKER_REGISTRY}"
                }
            }
        }
        
        // Stage triển khai tiếp theo (nếu có)
    }

    post {
        always {
            echo 'Pipeline finished.'
            script {
                try {
                    // Ghi lại kết quả test (dù không có file test)
                    junit '**/test-results/*.xml' 
                } catch (e) {
                    echo "JUnit report skipped: No test files found."
                }
            }
        }
        success {
            echo 'Build, Test, and Docker Push successful.'
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
                    echo "Could not remove image locally."
                }
            }
        }
    }
}

