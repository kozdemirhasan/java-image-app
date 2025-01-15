document.addEventListener('DOMContentLoaded', function() {
    // Eğer kullanıcı giriş yapmışsa ve login/register sayfalarındaysa ana sayfaya yönlendir
    const currentUser = localStorage.getItem('user');
    if (currentUser && (window.location.pathname.includes('login.html') || 
                       window.location.pathname.includes('register.html'))) {
        window.location.href = 'index.html';
    }

    // Login form işleme
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const credentials = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };
            
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials),
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Giriş başarısız');
                    });
                }
                return response.json();
            })
            .then(data => {
                localStorage.clear();
                sessionStorage.clear();
                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('loginTime', new Date().getTime());
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Hata:', error);
                alert(error.message || 'Giriş yapılırken bir hata oluştu');
            });
        });
    }
    
    // Register form işleme
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };
            
            fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Kayıt işlemi başarısız');
                    });
                }
                return response.json();
            })
            .then(data => {
                localStorage.clear();
                sessionStorage.clear();
                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('loginTime', new Date().getTime());
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Hata:', error);
                alert(error.message || 'Kayıt olurken bir hata oluştu');
            });
        });
    }
});

// Oturum kontrolü
function checkSession() {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
        const currentTime = new Date().getTime();
        const oneHour = 60 * 60 * 1000; // 1 saat
        
        if (currentTime - loginTime > oneHour) {
            // Oturum süresi dolmuş
            localStorage.removeItem('user');
            localStorage.removeItem('loginTime');
            fetch('/api/auth/logout', { method: 'POST' })
                .finally(() => {
                    window.location.href = 'login.html';
                });
        }
    }
}

// Her sayfa yüklendiğinde ve her dakika oturum kontrolü yap
setInterval(checkSession, 60000); // Her dakika kontrol et 