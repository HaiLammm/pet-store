// Jenkinsfile - Declarative Pipeline cho Next.js (Front-end) và Node/TS (Back-end)
pipeline {
    // SỬ DỤNG DOCKER AGENT ĐỂ ĐẢM BẢO MÔI TRƯỜNG NODE.JS SẴN SÀNG
    agent {
        docker {
            image 'node:20-slim' // Image này đã có sẵn Node.js 20
            args '-u root:root' // Đảm bảo quyền truy cập file
        }
    }

    // Định nghĩa các biến môi trường
    environment {
        // Tên thư mục của Front-end và Back-end
        FRONTEND_DIR = 'front-end'
        BACKEND_DIR  = 'back-end'
        // Tên image Docker cuối cùng để push (ví dụ)
        DOCKER_IMAGE_NAME = "my-app/full-stack"
        DOCKER_REGISTRY = "your-docker-registry.com"
        // Thêm biến cho Docker credentials ID nếu bạn sử dụng credentials trong Jenkins
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials' 
    }

    // Các bước của quy trình CI
    stages {
        
        // Stage 1: Checkout Code
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code from SCM...'
                // Lấy mã nguồn (checkout scm là bước mặc định khi dùng Git)
            }
        }

        // --- Back-end (Node.js/TypeScript) Stages ---
        // Không cần NVM vì chúng ta đang dùng Docker Agent
        
        stage('Backend: Install Dependencies & Build') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Installing backend dependencies...'
                    sh 'npm ci' // npm ci thay vì npm install
                    
                    echo 'Building backend TypeScript project...'
                    sh 'npm run build' // Chạy tsc
                }
            }
        }
        
        stage('Backend: Test & Lint') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Running backend linting...'
                    sh 'npm run lint'
                    
                    echo 'Running backend tests...'
                    sh 'npm test' // Thay thế bằng lệnh test thực tế (vd: npm run test:ci)
                }
            }
        }


        // --- Front-end (Next.js) Docker Stages ---

        stage('Frontend: Docker Build') {
            steps {
                echo 'Building Next.js Docker image...'
                script {
                    // Cấu hình Docker Tool nếu cần
                    // tool 'docker' 

                    // Sử dụng `docker build` để xây dựng image
                    sh "docker build -t ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend ./${FRONTEND_DIR}"
                    sh "docker tag ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend"
                }
            }
        }

        // --- Deployment/Push (Tùy chọn) ---
        
        stage('Push Docker Image') {
            // Chỉ chạy bước này khi build thành công
            when { expression { return currentBuild.result == 'SUCCESS' } }
            steps {
                echo 'Pushing Docker image to registry...'
                script {
                    // Đăng nhập vào Registry (bạn cần phải cấu hình Credentials trong Jenkins trước)
                    /*
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin ${DOCKER_REGISTRY}"
                    }
                    */
                    
                    // Push image
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend"
                    sh "docker tag ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest-frontend"
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest-frontend"
                }
            }
        }
    }

    // Các hành động sau khi Pipeline hoàn thành
    post {
        always {
            echo 'Pipeline finished.'
            junit '**/test-results/*.xml' // Ghi lại kết quả test nếu có
        }
        success {
            echo 'Build, Test, and Docker Build successful.'
        }
        failure {
            echo 'Pipeline failed. Please review the logs.'
        }
        cleanup {
            // Xóa image local sau khi push (để tránh đầy ổ đĩa trên Agent)
            script {
                try {
                    sh "docker rmi ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend"
                } catch (e) {
                    echo "Could not remove image: ${e}"
                }
            }
        }
    }
}

