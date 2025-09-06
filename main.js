// متغيرات عامة
let sidebarCollapsed = false;
let reports = [];
let editingReportId = null;
let maintenanceEmployees = [];

// تهيئة الصفحة (تم التعديل)
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('employeeName').textContent = currentUser.name;
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('ar-EG');
        loadReports();
        loadSettings();
        
        // دائما اعرض الشاشة الترحيبية عند الدخول
        showWelcomeScreen();
        
    } else {
        window.location.href = 'login.html';
    }
    // إعداد مستمع الوضع الليلي
    document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
    
    // إعداد مستمعي البحث
    document.getElementById('searchInput').addEventListener('input', filterReports);
});

// نظام الإشعارات
function showNotification(message, type = 'success', duration = 4000) {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check',
        error: 'fas fa-times',
        warning: 'fas fa-exclamation',
        info: 'fas fa-info'
    };

    notification.innerHTML = `
        <div class="flex items-start">
            <div class="notification-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="mr-3 flex-1">
                <p class="text-sm font-medium text-gray-800">${message}</p>
            </div>
            <button onclick="removeNotification(this)" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-sm"></i>
            </button>
        </div>
    `;

    container.appendChild(notification);

    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // إخفاء الإشعار تلقائياً
    setTimeout(() => {
        removeNotification(notification);
    }, duration);
}

function removeNotification(element) {
    const notification = element.closest ? element.closest('.notification') : element;
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// تبديل الشريط الجانبي
document.getElementById('toggleSidebar').addEventListener('click', function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const sidebarTitle = document.getElementById('sidebarTitle');
    const navTexts = document.querySelectorAll('.nav-text');
    
    if (sidebarCollapsed) {
        // توسيع الشريط الجانبي
        sidebar.classList.remove('w-16', 'sidebar-collapsed');
        sidebar.classList.add('w-64');
        mainContent.style.marginRight = '16rem';
        sidebarTitle.classList.remove('hidden');
        navTexts.forEach(text => text.classList.remove('hidden'));
        sidebarCollapsed = false;
    } else {
        // تصغير الشريط الجانبي (إظهار الأيقونات فقط)
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-16', 'sidebar-collapsed');
        mainContent.style.marginRight = '4rem';
        sidebarTitle.classList.add('hidden');
        navTexts.forEach(text => text.classList.add('hidden'));
        sidebarCollapsed = true;
    }
});

// عرض الأقسام
function showSection(sectionId) {
    // إظهار الشريط الجانبي
    document.getElementById('sidebar').style.display = 'flex';

    // إخفاء جميع الأقسام
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // إزالة التحديد من جميع عناصر التنقل
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-blue-800');
    });
    
    // عرض القسم المحدد
    document.getElementById(sectionId).classList.remove('hidden');
    
    // تحديد عنصر التنقل النشط
    event.target.closest('.nav-item').classList.add('bg-blue-800');
}

// تبديل الوضع الليلي
function toggleDarkMode() {
    const body = document.getElementById('body');
    const isDark = document.getElementById('darkModeToggle').checked;
    
    if (isDark) {
        body.classList.add('dark', 'bg-gray-900');
        body.classList.remove('bg-gray-50');
        showNotification('تم تفعيل الوضع الليلي', 'info');
    } else {
        body.classList.remove('dark', 'bg-gray-900');
        body.classList.add('bg-gray-50');
        showNotification('تم تفعيل الوضع النهاري', 'info');
    }
}

// التحقق من وجود مستخدم مسجل دخوله
window.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // إذا لم يكن المستخدم مسجل الدخول، قم بتوجيهه إلى صفحة التسجيل
        window.location.href = 'login.html';
        return;
    }
    
    // تعيين اسم المستخدم في التطبيق
    document.getElementById('employeeName').textContent = currentUser.name;
    document.getElementById('employeeNameSetting').value = currentUser.name;
});

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// عرض وإخفاء الشاشة الترحيبية
function showWelcomeScreen() {
    // إخفاء الشريط الجانبي
    document.getElementById('sidebar').style.display = 'none';
    
    // إخفاء جميع الأقسام
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // إظهار الشاشة الترحيبية
    document.getElementById('welcome').classList.remove('hidden');
    
    // إزالة التحديد من جميع عناصر التنقل
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-blue-800');
    });
}

function hideWelcomeScreen() {
    // إخفاء الشاشة الترحيبية
    document.getElementById('welcome').classList.add('hidden');
    
    // عرض قسم التقرير اليومي افتراضياً
    showSection('daily-report');
    
    // حفظ حالة عدم إظهار الشاشة الترحيبية مرة أخرى
    localStorage.setItem('welcomeScreenShown', 'true');
}