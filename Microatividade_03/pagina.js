function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const _data = { username, password };

    fetch('http://localhost:3000/auth', {
        method: 'POST',
        body: JSON.stringify(_data),
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
    })
        .then((response) => response.json())
        .then((json) => {
            const token = json.jwt_token;

            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload
                localStorage.setItem('token', token);
                localStorage.setItem('token_expiration', payload.exp);
                alert('Login bem-sucedido!');
            }
        })
        .catch((err) => console.log(err));
}

function doAction() {
    const token = localStorage.getItem('token');
    const tokenExpiration = localStorage.getItem('token_expiration');

    // Verifica se o token expirou
    if (!token || !tokenExpiration || Date.now() >= tokenExpiration * 1000) {
        alert('Token expirado. Faça login novamente.');
        window.location.href = '/login'; // Redireciona para a página de login
        return;
    }

    fetch('http://localhost:3000/do_SomeAction', {
        method: 'POST',
        body: JSON.stringify(null),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => response.json())
        .then((json) => {
            console.log(`response: ${JSON.stringify(json)}`);
        })
        .catch((err) => console.log(err));
}
