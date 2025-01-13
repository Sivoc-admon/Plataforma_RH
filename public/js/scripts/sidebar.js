const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');
function toggleSidebar() {
    if (!sidebar.classList.contains('active')){
        sidebar.classList.toggle('active');
    }
    content.classList.toggle('shifted');
}
function hideSidebar() {
    if (!content.classList.contains('shifted')){
        sidebar.classList.remove('active');
    }
}
document.querySelectorAll('.menu-list a').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.menu-list a').forEach(link => link.classList.remove('active'));
        item.classList.add('active');
    });
});