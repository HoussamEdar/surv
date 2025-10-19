document.addEventListener("DOMContentLoaded", function () {
    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-button');
    const closeBtn = document.getElementById('close-sidebar');
    const sidebar = document.querySelector('.sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', function () {
            sidebar.classList.add('active');
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', function () {
            sidebar.classList.remove('active');
        });
    }

    // Modal functionality
    const addUserModal = document.getElementById('add-user-modal');
    const editUserModal = document.getElementById('edit-user-modal');

    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function () {
            addUserModal.style.display = 'block';
        });
    }

    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function () {
            if (addUserModal) addUserModal.style.display = 'none';
            if (editUserModal) editUserModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function (event) {
        if (event.target === addUserModal) addUserModal.style.display = 'none';
        if (event.target === editUserModal) editUserModal.style.display = 'none';
    });

    // Show status message
    function showStatusMessage(message, type) {
        const statusDiv = document.getElementById('status-message');
        if (!statusDiv) return;

        statusDiv.className = `alert alert-${type}`;
        statusDiv.textContent = message;
        statusDiv.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 5000);
    }

    // Load users
    function loadUsers() {
        fetch('/users')
            .then(response => response.json())
            .then(users => {
                const tableBody = document.getElementById('users-table-body');
                if (!tableBody) return;

                if (users.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="4" class="py-4 px-4 text-center text-gray-500">No users found</td></tr>`;
                    return;
                }

                tableBody.innerHTML = '';
                users.forEach(user => {
                    const row = document.createElement('tr');
                    row.className = 'border-t border-gray-200 hover:bg-gray-50';
                    row.innerHTML = `
                        <td class="py-3 px-4 text-sm text-gray-800">${user.id}</td>
                        <td class="py-3 px-4 text-sm text-gray-800">${user.username}</td>
                        <td class="py-3 px-4 text-sm text-gray-800">
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                                ${user.role}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-sm text-gray-500 text-right">
                            <button class="edit-user-btn text-blue-600 hover:text-blue-800 mr-3" data-id="${user.id}" data-username="${user.username}" data-role="${user.role}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-user-btn text-red-600 hover:text-red-800" data-id="${user.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });

                // Edit button listeners
                document.querySelectorAll('.edit-user-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const userId = this.getAttribute('data-id');
                        const username = this.getAttribute('data-username');
                        const role = this.getAttribute('data-role');

                        document.getElementById('edit-user-id').value = userId;
                        document.getElementById('edit-username').value = username;
                        document.getElementById('edit-password').value = '';
                        document.getElementById('edit-role').value = role;

                        editUserModal.style.display = 'block';
                    });
                });

                // Delete button listeners
                document.querySelectorAll('.delete-user-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const userId = this.getAttribute('data-id');
                        if (confirm('Are you sure you want to delete this user?')) {
                            deleteUser(userId);
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Error loading users:', error);
                showStatusMessage('Failed to load users. Please try again.', 'error');
            });
    }

    // Create user
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = {
                username: document.getElementById('new-username').value,
                password: document.getElementById('new-password').value,
                role: document.getElementById('new-role').value
            };

            fetch('/create_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        showStatusMessage(data.message, 'success');
                        addUserModal.style.display = 'none';
                        addUserForm.reset();
                        loadUsers();
                    } else {
                        showStatusMessage(data.message, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error creating user:', error);
                    showStatusMessage('Failed to create user. Please try again.', 'error');
                });
        });
    }

    // Update user
    const editUserForm = document.getElementById('edit-user-form');
    if (editUserForm) {
        editUserForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const userId = document.getElementById('edit-user-id').value;
            const formData = {
                id: userId,
                username: document.getElementById('edit-username').value,
                password: document.getElementById('edit-password').value,
                role: document.getElementById('edit-role').value
            };

            if (!formData.password) {
                delete formData.password;
            }

            fetch('/users/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        showStatusMessage(data.message, 'success');
                        editUserModal.style.display = 'none';
                        loadUsers();
                    } else {
                        showStatusMessage(data.message, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                    showStatusMessage('Failed to update user. Please try again.', 'error');
                });
        });
    }

    // Delete user
    function deleteUser(userId) {
        fetch(`/users/delete/${userId}`, {
            method: 'POST'
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    showStatusMessage(data.message, 'success');
                    loadUsers();
                } else {
                    showStatusMessage(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                showStatusMessage('Failed to delete user. Please try again.', 'error');
            });
    }

    // Load users initially
    loadUsers();
});
