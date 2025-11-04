// Jenkinsfile - Declarative Pipeline cho Next.js (Front-end) và Node/TS (Back-end)
pipeline {
    // Sử dụng một Docker image làm Agent cho toàn bộ pipeline.
    // Điều này đảm bảo rằng Node.js, npm, và yarn (nếu dùng) đã sẵn sàng.
    agent {
        docker {
            image 'node:20-slim' // Dùng image tương tự như trong Dockerfile của bạn
            args '-u root:root' // Đảm bảo quyền truy cập file trong môi trường Jenkins
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
        
        stage('Backend: Install Dependencies & Build') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Installing backend dependencies...'
                    // Sử dụng npm ci để đảm bảo tính nhất quán (dựa trên package-lock.json)
                    sh 'npm ci' 
                    
                    echo 'Building backend TypeScript project...'
                    // Lệnh build đã định nghĩa trong package.json của bạn: "build": "tsc"
                    sh 'npm run build'
                }
            }
        }
        
        stage('Backend: Test & Lint') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Running backend linting...'
                    // Lệnh lint đã định nghĩa trong package.json của bạn: "lint": "eslint ."
                    sh 'npm run lint'
                    
                    echo 'Running backend tests...'
                    // Lệnh test hiện đang là 'echo "No tests yet"'. Cần thay thế bằng lệnh test thực tế.
                    sh 'npm test' 
                }
            }
        }


        // --- Front-end (Next.js) Docker Stages ---

        stage('Frontend: Docker Build') {
            steps {
                echo 'Building Next.js Docker image...'
                // Sử dụng Dockerfile trong thư mục front-end để tạo image
                // Image này chứa cả Next.js app đã được tối ưu cho Production
                script {
                    // Cấu hình Docker Tool nếu cần (thay thế 'docker' bằng tool config đã định nghĩa)
                    // tool 'docker' 

                    // Sử dụng `docker build` để xây dựng image
                    sh "docker build -t ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend ./${FRONTEND_DIR}"
                    sh "docker tag ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend"
                }
            }
        }

        // --- Deployment/Push (Tùy chọn) ---
        
        stage('Push Docker Image') {
            // Chỉ chạy bước này khi tất cả các stage trước đó thành công
            when { expression { return currentBuild.result == 'SUCCESS' } }
            steps {
                echo 'Pushing Docker image to registry...'
                script {
                    // Đăng nhập vào Registry (sử dụng credentials đã lưu trong Jenkins)
                    // withCredentials([usernamePassword(credentialsId: 'docker-registry-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    //     sh "docker login ${DOCKER_REGISTRY} -u ${DOCKER_USER} -p ${DOCKER_PASS}"
                    // }
                    
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
            echo 'Pipeline completed.'
            // Ghi lại kết quả build (Jenkins ghi lại tự động nhưng đây là một bước xác nhận)
            junit '**/test-results/*.xml' // Nếu bạn có file kết quả test
        }
        success {
            echo 'Successfully built, tested, and pushed images.'
        }
        failure {
            echo 'Build failed. Please review the logs.'
        }
        cleanup {
            // Xóa image local sau khi push (để tránh đầy ổ đĩa trên Agent)
            script {
                try {
                    sh "docker rmi ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}-frontend"
                } catch (e) {
                    echo "Could not remove image: ${e}"
                }
            }
        }
    }
}

