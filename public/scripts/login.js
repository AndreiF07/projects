const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(form)
    const data = Object.fromEntries(formData)
    const res = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    if (res.status === 401) {
        document.getElementById("wrongCredP").classList.toggle('none')
    }

    if (res.status === 200) {
        const info = await res.json()
        const role = info.role
        if (role === 'admin') {
            window.location.href = '/admin/dashboard'
        } else if (role === 'user') {
            window.location.href = '/user/dashboard'
        }
        
    }
})