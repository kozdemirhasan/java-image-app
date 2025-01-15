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

function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    checkSession();
}

document.addEventListener('DOMContentLoaded', function() {
    checkAuth(); // Sayfa yüklendiğinde auth kontrolü yap
    
    // Kullanıcı adını göster
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.username) {
        document.getElementById('userUsername').textContent = user.username;
    }
    
    // Dil tercihini kontrol et
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    if (preferredLanguage) {
        // Kullanıcının daha önce seçtiği dil varsa onu kullan
        document.getElementById('languageSelect').value = preferredLanguage;
        changeLanguage(preferredLanguage);
    } else {
        // Tarayıcı dilini al
        let browserLang = navigator.language || navigator.userLanguage;
        browserLang = browserLang.substring(0, 2).toLowerCase(); // "tr-TR" -> "tr"
        
        // Desteklenen dilleri kontrol et
        const supportedLanguages = ['en', 'de', 'tr', 'ar', 'zh'];
        const defaultLang = 'en'; // Varsayılan dil
        
        // Tarayıcı dili destekleniyorsa onu kullan, desteklenmiyorsa varsayılan dili kullan
        const initialLang = supportedLanguages.includes(browserLang) ? browserLang : defaultLang;
        
        // Dil seçicisini güncelle ve dili ayarla
        document.getElementById('languageSelect').value = initialLang;
        changeLanguage(initialLang);
    }
    
    loadPlayers();
    
    // Form submit olayını dinle
    document.getElementById('playerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createPlayer();
    });
    
    // Düzenleme kaydet butonunu dinle
    document.getElementById('saveEdit').addEventListener('click', function() {
        updatePlayer();
    });
});

// Her dakika oturum kontrolü yap
setInterval(checkSession, 60000);

// Oyuncuları yükle
function loadPlayers() {
    fetch('/api/players', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'login.html';
                throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            }
            throw new Error('Oyuncu listesi alınamadı');
        }
        return response.json();
    })
    .then(players => {
        const tbody = document.getElementById('playerList');
        tbody.innerHTML = ''; // Listeyi temizle
        
        if (players.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Henüz oyuncu bulunmamaktadır.</td></tr>';
            return;
        }
        
        // Mevcut dildeki çevirileri al
        const editText = document.getElementById('editModalTitle').textContent;
        const deleteText = document.querySelector('.btn-danger') ? 
            document.querySelector('.btn-danger').textContent.trim() : 'Sil';
        
        players.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${player.profileImage ? `/api/players/${player.id}/image?t=${new Date().getTime()}` : 'https://via.placeholder.com/50'}" 
                         class="player-image" alt="Profil"></td>
                <td>${player.name || '-'}</td>
                <td>${player.position || '-'}</td>
                <td>${player.jerseyNumber || '-'}</td>
                <td>${player.nationality || '-'}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-primary" onclick="editPlayer(${player.id})">
                            ${editText}
                        </button>
                        <button class="btn btn-info" onclick="printPlayer(${player.id})">
                            <i class="bi bi-printer"></i>
                        </button>
                        <button class="btn btn-danger btn-delete" onclick="deletePlayer(${player.id})">
                            ${deleteText}
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Hata:', error);
        const tbody = document.getElementById('playerList');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Veriler yüklenirken bir hata oluştu!</td></tr>';
        
        if (error.message.includes('Oturum süreniz dolmuş')) {
            alert(error.message);
        }
    });
}

// Yeni oyuncu oluştur
function createPlayer() {
    const formData = new FormData();
    const playerData = {
        name: document.getElementById('name').value,
        birthDate: document.getElementById('birthDate').value,
        position: document.getElementById('position').value,
        jerseyNumber: document.getElementById('jerseyNumber').value,
        nationality: document.getElementById('nationality').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value
    };
    
    formData.append('player', JSON.stringify(playerData));
    
    const imageFile = document.getElementById('image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    fetch('/api/players', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'login.html';
                throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            }
            throw new Error('Kayıt başarısız oldu');
        }
        return response.json();
    })
    .then(() => {
        document.getElementById('playerForm').reset();
        resetFileInput('image', 'selectedFileName');
        loadPlayers();
        alert('Oyuncu başarıyla eklendi!');
    })
    .catch(error => {
        console.error('Hata:', error);
        alert('Kayıt sırasında bir hata oluştu: ' + error.message);
    });
}

// Oyuncu düzenleme modalını aç
function editPlayer(id) {
    fetch(`/api/players/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'login.html';
                throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            }
            throw new Error('Oyuncu bilgileri alınamadı');
        }
        return response.json();
    })
    .then(player => {
        document.getElementById('editId').value = player.id;
        document.getElementById('editName').value = player.name;
        document.getElementById('editBirthDate').value = player.birthDate;
        document.getElementById('editPosition').value = player.position;
        document.getElementById('editJerseyNumber').value = player.jerseyNumber;
        document.getElementById('editNationality').value = player.nationality;
        document.getElementById('editHeight').value = player.height;
        document.getElementById('editWeight').value = player.weight;
        
        new bootstrap.Modal(document.getElementById('editModal')).show();
    })
    .catch(error => {
        console.error('Hata:', error);
        alert(error.message);
    });
}

// Oyuncu güncelle
function updatePlayer() {
    const id = document.getElementById('editId').value;
    const formData = new FormData();
    const playerData = {
        id: id,
        name: document.getElementById('editName').value,
        birthDate: document.getElementById('editBirthDate').value,
        position: document.getElementById('editPosition').value,
        jerseyNumber: document.getElementById('editJerseyNumber').value,
        nationality: document.getElementById('editNationality').value,
        height: document.getElementById('editHeight').value,
        weight: document.getElementById('editWeight').value
    };
    
    formData.append('player', JSON.stringify(playerData));
    
    const imageFile = document.getElementById('editImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    fetch(`/api/players/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Güncelleme başarısız oldu');
        }
        return response.json();
    })
    .then(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        if (modal) {
            modal.hide();
        }
        loadPlayers();
        alert('Oyuncu başarıyla güncellendi!');
    })
    .catch(error => {
        console.error('Hata:', error);
        alert('Güncelleme sırasında bir hata oluştu: ' + error.message);
    });
}

// Oyuncu sil
function deletePlayer(id) {
    if (confirm('Bu oyuncuyu silmek istediğinizden emin misiniz?')) {
        fetch(`/api/players/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = 'login.html';
                    throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
                }
                throw new Error('Silme işlemi başarısız oldu');
            }
            loadPlayers();
            alert('Oyuncu başarıyla silindi!');
        })
        .catch(error => {
            console.error('Hata:', error);
            alert('Silme sırasında bir hata oluştu: ' + error.message);
        });
    }
}

// Oyuncu raporunu indir
function printPlayer(id) {
    fetch(`/api/players/${id}/report`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Rapor oluşturulamadı');
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `player_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    })
    .catch(error => {
        console.error('Hata:', error);
        alert('Rapor oluşturulurken bir hata oluştu: ' + error.message);
    });
}

function updateUIText(translations) {
    // Helper fonksiyon ekleyelim
    function updateElementText(id, translationKey) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = translations[translationKey];
        }
    }

    // Başlıklar
    document.title = translations['nav.title'];
    const brandElement = document.querySelector('.navbar-brand');
    if (brandElement) {
        brandElement.textContent = translations['nav.title'];
    }
    
    // Tüm elementleri güvenli bir şekilde güncelleyelim
    updateElementText('pageTitle', 'nav.title');
    updateElementText('addPlayerTitle', 'player.add');
    updateElementText('welcomeText', 'nav.welcome');
    updateElementText('logoutBtn', 'nav.logout');
    
    // Tablo başlıkları
    updateElementText('imageHeader', 'player.image');
    updateElementText('nameHeader', 'player.name');
    updateElementText('positionHeader', 'player.position');
    updateElementText('jerseyHeader', 'player.jerseyNumber');
    updateElementText('nationalityHeader', 'player.nationality');
    updateElementText('actionsHeader', 'player.actions');
    
    // Form etiketleri
    updateElementText('nameLabel', 'player.name');
    updateElementText('birthDateLabel', 'player.birthDate');
    updateElementText('positionLabel', 'player.position');
    updateElementText('jerseyNumberLabel', 'player.jerseyNumber');
    updateElementText('nationalityLabel', 'player.nationality');
    updateElementText('heightLabel', 'player.height');
    updateElementText('weightLabel', 'player.weight');
    updateElementText('imageLabel', 'player.image');
    
    // Modal etiketleri
    updateElementText('editModalTitle', 'player.edit');
    updateElementText('editNameLabel', 'player.name');
    updateElementText('editBirthDateLabel', 'player.birthDate');
    updateElementText('editPositionLabel', 'player.position');
    updateElementText('editJerseyNumberLabel', 'player.jerseyNumber');
    updateElementText('editNationalityLabel', 'player.nationality');
    updateElementText('editHeightLabel', 'player.height');
    updateElementText('editWeightLabel', 'player.weight');
    updateElementText('editImageLabel', 'player.image');
    
    // Butonlar
    updateElementText('saveBtn', 'btn.save');
    updateElementText('cancelBtn', 'btn.cancel');
    updateElementText('saveEditBtn', 'btn.save');
    
    // Tablo içindeki butonları güncelle
    document.querySelectorAll('.btn-primary').forEach(btn => {
        // Düzenle butonlarını güncelle
        if(['Edit', 'Bearbeiten', 'Düzenle', 'تعديل', '编辑'].includes(btn.textContent.trim())) {
            btn.textContent = translations['player.edit'];
        }
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        // Sil butonlarını güncelle
        if(['Delete', 'Löschen', 'Sil', 'حذف', '删除'].includes(btn.textContent.trim())) {
            btn.textContent = translations['player.delete'];
        }
    });

    // Oyuncu listesini yeniden yükle
    loadPlayers();

    // Dosya seçici metinlerini güncelle
    const fileInputs = document.querySelectorAll('.custom-file-input input[type="file"]');
    fileInputs.forEach(input => {
        const fileNameElement = input.nextElementSibling;
        if (fileNameElement) {
            if (!input.files || input.files.length === 0) {
                fileNameElement.textContent = translations['file.none'];
            }
        }
        
        // Change event listener'ı ekle
        input.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name;
            if (fileNameElement) {
                fileNameElement.textContent = fileName || translations['file.none'];
                const container = input.closest('.custom-file-input');
                if (container) {
                    if (fileName) {
                        container.classList.add('has-file');
                    } else {
                        container.classList.remove('has-file');
                    }
                }
            }
        });
    });
}

function changeLanguage(lang) {
    console.log('Dil değiştiriliyor:', lang);
    fetch(`/api/language/change?lang=${lang}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('API yanıtı:', response);
        if (!response.ok) {
            throw new Error('Dil değiştirme isteği başarısız oldu');
        }
        return response.json();
    })
    .then(translations => {
        console.log('Çeviriler:', translations);
        if (!translations) {
            throw new Error('Çeviriler alınamadı');
        }
        updateUIText(translations);
        localStorage.setItem('preferredLanguage', lang);
        
        if (lang === 'ar') {
            document.dir = 'rtl';
            document.body.classList.add('rtl');
        } else {
            document.dir = 'ltr';
            document.body.classList.remove('rtl');
        }
    })
    .catch(error => {
        console.error('Dil değiştirme hatası:', error);
        alert('Dil değiştirme sırasında bir hata oluştu: ' + error.message);
    });
}

// Sayfa yüklendiğinde tercih edilen dili ayarla
document.addEventListener('DOMContentLoaded', function() {
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    if (preferredLanguage) {
        changeLanguage(preferredLanguage);
    }
});

// Dosya seçici işlevlerini güncelleyelim
function handleFileSelect(inputId, buttonTextId, fileNameId) {
    const input = document.getElementById(inputId);
    const fileNameElement = document.getElementById(fileNameId);
    const container = input.closest('.custom-file-input');
    
    // Dosya seçildiğinde
    input.addEventListener('change', function(e) {
        const fileName = e.target.files[0]?.name;
        if (fileName) {
            fileNameElement.textContent = fileName;
            container.classList.add('has-file');
        } else {
            fileNameElement.textContent = translations['file.none'] || 'Dosya seçilmedi';
            container.classList.remove('has-file');
        }
    });
}

// Form temizleme fonksiyonu
function resetFileInput(inputId, fileNameId) {
    const input = document.getElementById(inputId);
    const fileNameElement = document.getElementById(fileNameId);
    if (input && fileNameElement) {
        input.value = '';
        fileNameElement.textContent = translations['file.none'] || 'Dosya seçilmedi';
        const container = input.closest('.custom-file-input');
        if (container) {
            container.classList.remove('has-file');
        }
    }
} 