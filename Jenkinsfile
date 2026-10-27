pipeline {
    agent any

    environment {
        IMAGE_NAME = 'https://github.com/shameerkhan734-spec/Shop-Easy.gitYOUR_DOCKERHUB_USERNAME/shopeasy-backend'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                    docker build \
                      -t "$IMAGE_NAME:$IMAGE_TAG" \
                      ./backend
                '''
            }
        }

        stage('Validate Image') {
            steps {
                sh '''
                    docker image inspect \
                      "$IMAGE_NAME:$IMAGE_TAG"
                '''
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: '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',
                        usernameVariable: 'shameer1220',
                        passwordVariable: 'dckr_pat_fuwKFRnrNlIvUdW0Dh0AaZMlKhY'
                    )
                ]) {
                    sh '''
                        set +x
                        echo "$DOCKER_TOKEN" |
                          docker login -u "shameer1220" \
                            --password-stdin

                        docker push "$IMAGE_NAME:$IMAGE_TAG"

                        docker logout
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'ShopEasy pipeline finished.'
        }
    }
}
