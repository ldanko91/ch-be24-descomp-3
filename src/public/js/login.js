const loginForm = document.getElementById('loginForm')

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(loginForm)
    const obj = {}

    data.forEach((value, key) => (obj[key] = value))

    const url = '/api/sessions/login';
    const headers = {
        'Content-type': 'application/json',
    };
    const method = 'POST';
    const body = JSON.stringify(obj);

    // console.log(JSON.parse(body))
    fetch(url, {
        headers: {
            'Content-type': 'application/json',
        },
        method: method,
        body: body,
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.log(error))
})