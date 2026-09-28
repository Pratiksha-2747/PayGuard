class ApiResponse {
    constructor(statusCode, data, message = "Sucess") {
        this.data = data
        this.statusCode = statusCode
        this.message = message
        this.sucess = statusCode < 400
    }
}

export { ApiResponse }