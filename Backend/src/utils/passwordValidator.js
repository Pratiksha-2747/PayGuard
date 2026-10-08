const validatePasswordStrength = (password, username, email) => {
    const errors = []

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long")
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter")
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter")
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number")
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("Password must contain at least one special character")
    }

    const emailLocalPart = email.split('@')[0]
    const passwordLower = password.toLowerCase()
    const usernameLower = username.toLowerCase()
    const emailLocalLower = emailLocalPart.toLowerCase()

    if (passwordLower.includes(usernameLower)) {
        errors.push("Password must not contain your username")
    }

    if (passwordLower.includes(emailLocalLower)) {
        errors.push("Password must not contain your email local part")
    }

    if (errors.length > 0) {
        return {
            isValid: false,
            errors
        }
    }

    return {
        isValid: true,
        errors: []
    }
}

export { validatePasswordStrength }
