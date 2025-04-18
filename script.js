

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyCIpv7bzTWslsvUt2kvCw4ED18GAyYiPSY",
            authDomain: "suppliermanagement-45701.firebaseapp.com",
            projectId: "suppliermanagement-45701",
            storageBucket: "suppliermanagement-45701.appspot.com",
            messagingSenderId: "292117808833",
            appId: "1:292117808833:web:d6694a6d8a09daba83f640",
            measurementId: "G-FJWKVED5HH"
        };

        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        const database = firebase.database();

        // Initialize jsPDF
        const { jsPDF } = window.jspdf;

        // Exchange rates with MVR as base currency
        const EXCHANGE_RATES = {
            MVR: 1,      // Base currency
            USD: 15.42,  // 1 USD = 15.42 MVR
            AED: 4.20,   // 1 AED = 4.20 MVR
            CNY: 2.13,   // 1 CNY = 2.13 MVR
            EUR: 16.80,  // 1 EUR = 16.80 MVR
            IDR: 0.0010, // 1 IDR = 0.0010 MVR
            INR: 0.19,   // 1 INR = 0.19 MVR
            JPY: 0.11,   // 1 JPY = 0.11 MVR
            LKR: 0.051,  // 1 LKR = 0.051 MVR
            MYR: 3.45,   // 1 MYR = 3.45 MVR
            NZD: 9.50,   // 1 NZD = 9.50 MVR
            SAR: 4.11,   // 1 SAR = 4.11 MVR
            SEK: 1.50,   // 1 SEK = 1.50 MVR
            SGD: 11.50,  // 1 SGD = 11.50 MVR
            THB: 0.43    // 1 THB = 0.43 MVR
        };

        // Expense categories
        const EXPENSE_CATEGORIES = [
            "REDBOX",
            "WEIGHT",
            "CLEARENCE",
            "OTHER"
        ];

        document.addEventListener('DOMContentLoaded', function() {
            // Main tab functionality
            const mainTabs = document.querySelectorAll('.main-tab');
            const mainTabContents = document.querySelectorAll('.tab-content');
            
            mainTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remove active class from all main tabs and contents
                    mainTabs.forEach(t => t.classList.remove('active'));
                    mainTabContents.forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked tab and corresponding content
                    this.classList.add('active');
                    const tabContentId = this.dataset.tab === 'supplier' ? 'supplierManagement' : 
                                      this.dataset.tab === 'expenses' ? 'expensesManagement' :
                                      this.dataset.tab === 'sales' ? 'salesManagement' : 'stockManagement';
                    document.getElementById(tabContentId).classList.add('active');
                    
                    // Reset sub-tabs to first tab
                    const subTabs = document.querySelectorAll(`#${tabContentId} .sub-tab`);
                    const subTabContents = document.querySelectorAll(`#${tabContentId} .tab-content`);
                    
                    subTabs.forEach(st => st.classList.remove('active'));
                    subTabContents.forEach(stc => stc.classList.remove('active'));
                    
                    if (subTabs.length > 0) {
                        subTabs[0].classList.add('active');
                        const firstSubTabContentId = subTabs[0].dataset.subtab === 'supplier-entry' ? 'supplierEntryForm' : 
                                                  subTabs[0].dataset.subtab === 'supplier-summary' ? 'supplierOrderSummary' :
                                                  subTabs[0].dataset.subtab === 'expenses-entry' ? 'expensesEntryForm' : 
                                                  subTabs[0].dataset.subtab === 'expenses-summary' ? 'expensesSummary' :
                                                  subTabs[0].dataset.subtab === 'sales-entry' ? 'salesEntryForm' :
                                                  subTabs[0].dataset.subtab === 'sales-summary' ? 'salesSummary' :
                                                  subTabs[0].dataset.subtab === 'sales-analysis' ? 'salesAnalysis' :
                                                  subTabs[0].dataset.subtab === 'stock-entry' ? 'stockEntryForm' : 'stockSummary';
                        document.getElementById(firstSubTabContentId).classList.add('active');
                    }
                    
                    // If summary tab is clicked, load data
                    if (this.dataset.tab === 'supplier' && document.querySelector('#supplierManagement .sub-tab.active').dataset.subtab === 'supplier-summary') {
                        loadSupplierOrders();
                    } else if (this.dataset.tab === 'expenses' && document.querySelector('#expensesManagement .sub-tab.active').dataset.subtab === 'expenses-summary') {
                        loadExpenses();
                    } else if (this.dataset.tab === 'sales' && document.querySelector('#salesManagement .sub-tab.active').dataset.subtab === 'sales-summary') {
                        loadSales();
                    } else if (this.dataset.tab === 'sales' && document.querySelector('#salesManagement .sub-tab.active').dataset.subtab === 'sales-analysis') {
                        // Initialize sales analysis tab
                        const today = new Date().toISOString().split('T')[0];
                        document.getElementById('analysisStartDate').value = today;
                        document.getElementById('analysisEndDate').value = today;
                    } else if (this.dataset.tab === 'stock' && document.querySelector('#stockManagement .sub-tab.active').dataset.subtab === 'stock-summary') {
                        loadStock();
                    }
                });
            });

            // Sub-tab functionality
            function setupSubTabs(containerId) {
                const subTabs = document.querySelectorAll(`#${containerId} .sub-tab`);
                const subTabContents = document.querySelectorAll(`#${containerId} .tab-content`);
                
                subTabs.forEach(tab => {
                    tab.addEventListener('click', function() {
                        // Remove active class from all sub tabs and contents
                        subTabs.forEach(t => t.classList.remove('active'));
                        subTabContents.forEach(c => c.classList.remove('active'));
                        
                        // Add active class to clicked tab and corresponding content
                        this.classList.add('active');
                        const tabContentId = this.dataset.subtab === 'supplier-entry' ? 'supplierEntryForm' : 
                                          this.dataset.subtab === 'supplier-summary' ? 'supplierOrderSummary' :
                                          this.dataset.subtab === 'expenses-entry' ? 'expensesEntryForm' : 
                                          this.dataset.subtab === 'expenses-summary' ? 'expensesSummary' :
                                          this.dataset.subtab === 'sales-entry' ? 'salesEntryForm' :
                                          this.dataset.subtab === 'sales-summary' ? 'salesSummary' :
                                          this.dataset.subtab === 'sales-analysis' ? 'salesAnalysis' :
                                          this.dataset.subtab === 'stock-entry' ? 'stockEntryForm' : 'stockSummary';
                        document.getElementById(tabContentId).classList.add('active');
                        
                        // If summary tab is clicked, load data
                        if (this.dataset.subtab === 'supplier-summary') {
                            loadSupplierOrders();
                        } else if (this.dataset.subtab === 'expenses-summary') {
                            loadExpenses();
                        } else if (this.dataset.subtab === 'sales-summary') {
                            loadSales();
                        } else if (this.dataset.subtab === 'sales-analysis') {
                            // Initialize sales analysis tab
                            const today = new Date().toISOString().split('T')[0];
                            document.getElementById('analysisStartDate').value = today;
                            document.getElementById('analysisEndDate').value = today;
                        } else if (this.dataset.subtab === 'stock-summary') {
                            loadStock();
                        }
                    });
                });
            }
            
            // Setup sub-tabs for all main tabs
            setupSubTabs('supplierManagement');
            setupSubTabs('expensesManagement');
            setupSubTabs('salesManagement');
            setupSubTabs('stockManagement');

            // ==============================================
            // SUPPLIER MANAGEMENT FUNCTIONALITY
            // ==============================================
            const orderItems = document.getElementById('orderItems');
            const addItemBtn = document.getElementById('addItem');
            const submitOrderBtn = document.getElementById('submitOrder');
            const deleteAllSupplierOrdersBtn = document.getElementById('deleteAllSupplierOrders');
            const exportSupplierSummaryPdf = document.getElementById('exportSupplierSummaryPdf');
            const subtotalCell = document.getElementById('subtotal');
            const grandTotalCell = document.getElementById('grandTotal');
            const currencySelector = document.getElementById('currency');
            const currentCurrencyDisplay = document.getElementById('currentCurrency');
            const currentCurrencyFlag = document.getElementById('currentCurrencyFlag');
            const rateInfo = document.getElementById('rateInfo');
            const amountPaidInput = document.getElementById('amountPaid');
            const totalAmountDisplay = document.getElementById('totalAmount');
            
            // Add initial empty row
            addOrderItemRow();
            
            // Add order item row
            addItemBtn.addEventListener('click', addOrderItemRow);
            
            // Submit order
            submitOrderBtn.addEventListener('click', submitOrder);
            
            // Delete all orders
            deleteAllSupplierOrdersBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete ALL supplier orders? This cannot be undone.')) {
                    database.ref('supplierOrders').remove()
                        .then(() => {
                            alert('All supplier orders have been deleted.');
                            loadSupplierOrders(); // Refresh the view
                        })
                        .catch(error => {
                            alert('Error deleting orders: ' + error.message);
                        });
                }
            });
            
            // Export summary to PDF
            exportSupplierSummaryPdf.addEventListener('click', exportSupplierSummaryToPDF);
            
            // Currency selection change
            currencySelector.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const currency = selectedOption.value;
                const symbol = selectedOption.dataset.symbol || currency;
                const flag = selectedOption.dataset.flag || '';
                
                // Update currency display
                currentCurrencyDisplay.textContent = currency;
                currentCurrencyFlag.innerHTML = flag ? `<img src="${flag}" class="currency-flag">` : '';
                
                // Update all currency symbols in the table
                document.querySelectorAll('.currency-symbol').forEach(el => {
                    el.textContent = symbol;
                });
                
                // Update exchange rate info
                if (currency && currency !== 'MVR') {
                    const rate = EXCHANGE_RATES[currency] || 1;
                    rateInfo.textContent = `Exchange rate: 1 ${currency} = ${rate.toFixed(4)} MVR`;
                } else {
                    rateInfo.textContent = 'No exchange rate needed for MVR';
                }
                
                // Recalculate totals to update currency symbols
                updateOrderTotals();
            });
            
            function addOrderItemRow() {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="text" class="item-desc" placeholder="Item description"></td>
                    <td><input type="number" class="item-qty" min="1" value="1"></td>
                    <td><input type="number" class="item-price" min="0" step="0.01" value="0.00"></td>
                    <td class="item-total"><span class="currency-symbol">--</span> 0.00</td>
                    <td><button type="button" class="btn btn-danger remove-item"><i class="fas fa-times"></i></button></td>
                `;
                orderItems.appendChild(row);
                
                // Add event listeners
                const descInput = row.querySelector('.item-desc');
                const qtyInput = row.querySelector('.item-qty');
                const priceInput = row.querySelector('.item-price');
                const removeBtn = row.querySelector('.remove-item');
                
                qtyInput.addEventListener('input', () => calculateOrderRowTotal(row));
                priceInput.addEventListener('input', () => calculateOrderRowTotal(row));
                removeBtn.addEventListener('click', () => {
                    row.remove();
                    updateOrderTotals();
                });
                
                calculateOrderRowTotal(row);
            }
            
            function calculateOrderRowTotal(row) {
                const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const total = qty * price;
                
                const currencySymbol = document.querySelector('.currency-symbol').textContent || '--';
                row.querySelector('.item-total').innerHTML = `<span class="currency-symbol">${currencySymbol}</span> ${total.toFixed(2)}`;
                
                updateOrderTotals();
            }
            
            function updateOrderTotals() {
                const rows = document.querySelectorAll('#orderItems tr');
                let subtotal = 0;
                
                rows.forEach(row => {
                    const totalText = row.querySelector('.item-total').textContent;
                    subtotal += parseFloat(totalText.replace(/[^0-9.-]+/g, '')) || 0;
                });
                
                const currencySymbol = document.querySelector('.currency-symbol').textContent || '--';
                subtotalCell.innerHTML = `<span class="currency-symbol">${currencySymbol}</span> ${subtotal.toFixed(2)}`;
                grandTotalCell.innerHTML = `<span class="currency-symbol">${currencySymbol}</span> ${subtotal.toFixed(2)}`;
                
                // Update total amount display
                totalAmountDisplay.innerHTML = `<span class="currency-symbol">${currencySymbol}</span> ${subtotal.toFixed(2)}`;
            }
            
            function submitOrder() {
                const orderDate = document.getElementById('orderDate').value;
                const supplier = document.getElementById('supplier').value;
                const currency = document.getElementById('currency').value;
                const amountPaid = parseFloat(amountPaidInput.value) || 0;
                const notes = document.getElementById('notes').value;
                
                if (!orderDate || !supplier || !currency) {
                    alert('Please fill in all required fields');
                    return;
                }
                
                const rows = document.querySelectorAll('#orderItems tr');
                if (rows.length === 0) {
                    alert('Please add at least one item');
                    return;
                }
                
                // Collect order items
                const items = [];
                let allItemsValid = true;
                
                rows.forEach(row => {
                    const desc = row.querySelector('.item-desc').value;
                    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                    const price = parseFloat(row.querySelector('.item-price').value) || 0;
                    
                    if (!desc) {
                        allItemsValid = false;
                        return;
                    }
                    
                    if (qty <= 0 || price <= 0) {
                        allItemsValid = false;
                        return;
                    }
                    
                    items.push({
                        description: desc,
                        quantity: qty,
                        unitPrice: price,
                        total: qty * price
                    });
                });
                
                if (!allItemsValid || items.length === 0) {
                    alert('Please add valid items with descriptions, quantities and prices');
                    return;
                }
                
                // Calculate totals
                const subtotal = items.reduce((sum, item) => sum + item.total, 0);
                
                // Create order object
                const order = {
                    orderNumber: generateOrderNumber(),
                    date: orderDate,
                    supplier: supplier,
                    currency: currency,
                    items: items,
                    subtotal: subtotal,
                    total: subtotal,
                    amountPaid: amountPaid,
                    status: 'pending',
                    notes: notes,
                    timestamp: new Date().toISOString()
                };
                
                // Save to Firebase
                saveOrderToFirebase(order);
            }
            
            function generateOrderNumber() {
                const now = new Date();
                return 'ORD-' + now.getFullYear() + 
                       String(now.getMonth() + 1).padStart(2, '0') + 
                       String(now.getDate()).padStart(2, '0') + '-' + 
                       String(Math.floor(Math.random() * 1000)).padStart(3, '0');
            }
            
            function saveOrderToFirebase(order) {
                const newOrderRef = database.ref('supplierOrders').push();
                newOrderRef.set(order)
                    .then(() => {
                        // Show success and switch to summary tab
                        alert(`Order submitted successfully!\nOrder Number: ${order.orderNumber}`);
                        
                        // Switch to summary tab and load orders
                        document.querySelector('#supplierManagement .sub-tab[data-subtab="supplier-summary"]').click();
                        
                        // Reset form
                        resetOrderForm();
                    })
                    .catch(error => {
                        alert('Error saving order: ' + error.message);
                    });
            }
            
            function resetOrderForm() {
                document.getElementById('orderDate').value = '';
                document.getElementById('supplier').value = '';
                document.getElementById('currency').value = '';
                document.getElementById('amountPaid').value = '0.00';
                document.getElementById('notes').value = '';
                orderItems.innerHTML = '';
                addOrderItemRow();
                
                // Reset currency display
                currentCurrencyDisplay.textContent = 'Select currency';
                currentCurrencyFlag.innerHTML = '';
                document.querySelectorAll('.currency-symbol').forEach(el => {
                    el.textContent = '--';
                });
                rateInfo.textContent = 'Exchange rates will be loaded when currency is selected';
            }
            
            function loadSupplierOrders() {
                const ordersList = document.getElementById('supplierOrdersList');
                const loadingIndicator = document.getElementById('supplierLoadingIndicator');
                const ordersTable = document.getElementById('supplierOrdersTable');
                const summaryTotals = document.getElementById('supplierSummaryTotals');
                
                // Show loading indicator
                loadingIndicator.style.display = 'block';
                ordersTable.style.display = 'none';
                summaryTotals.style.display = 'none';
                
                // Listen for real-time updates from Firebase
                database.ref('supplierOrders').on('value', (snapshot) => {
                    const orders = [];
                    let totalSubtotal = 0;
                    let totalPaid = 0;
                    
                    snapshot.forEach((childSnapshot) => {
                        const order = childSnapshot.val();
                        order.firebaseId = childSnapshot.key; // Store Firebase ID for updates
                        orders.push(order);
                        
                        // Calculate totals
                        totalSubtotal += order.total || 0;
                        totalPaid += order.amountPaid || 0;
                    });
                    
                    // Update summary totals
                    document.getElementById('totalOrders').textContent = orders.length;
                    document.getElementById('totalSubtotal').textContent = totalSubtotal.toFixed(2);
                    document.getElementById('totalPaid').textContent = totalPaid.toFixed(2);
                    
                    if (orders.length === 0) {
                        ordersList.innerHTML = '<tr><td colspan="7" style="text-align: center;">No orders found</td></tr>';
                    } else {
                        renderOrdersTable(orders);
                    }
                    
                    // Hide loading indicator and show table and totals
                    loadingIndicator.style.display = 'none';
                    ordersTable.style.display = 'table';
                    summaryTotals.style.display = 'grid';
                });
            }
            
            function renderOrdersTable(orders) {
                const ordersList = document.getElementById('supplierOrdersList');
                
                // Sort orders by date (newest first)
                orders.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // Calculate grand totals
                let grandSubtotal = 0;
                let grandPaid = 0;
                
                // Render orders table
                ordersList.innerHTML = orders.map(order => {
                    // Add to grand totals
                    grandSubtotal += order.total || 0;
                    grandPaid += order.amountPaid || 0;
                    
                    return `
                        <tr data-order-id="${order.orderNumber}" data-firebase-id="${order.firebaseId}">
                            <td>${new Date(order.date).toLocaleDateString()}</td>
                            <td>${order.orderNumber}</td>
                            <td>${order.supplier}</td>
                            <td>${order.currency} ${order.total.toFixed(2)}</td>
                            <td>MVR ${order.amountPaid.toFixed(2)}</td>
                            <td>
                                <select class="status-select" data-order="${order.firebaseId}">
                                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                </select>
                            </td>
                            <td>
                                <button class="btn btn-primary view-order"><i class="fas fa-eye"></i> Details</button>
                                <button class="btn btn-danger delete-order" data-order="${order.firebaseId}"><i class="fas fa-trash-alt"></i> Delete</button>
                                <button class="btn btn-warning export-order-pdf" data-order="${order.firebaseId}"><i class="fas fa-file-pdf"></i> PDF</button>
                            </td>
                        </tr>
                    `;
                }).join('');
                
                // Update grand totals row
                document.getElementById('supplierGrandSubtotal').textContent = `MVR ${grandSubtotal.toFixed(2)}`;
                document.getElementById('supplierGrandPaid').textContent = `MVR ${grandPaid.toFixed(2)}`;
                
                // Add event listeners to view buttons
                document.querySelectorAll('.view-order').forEach(button => {
                    button.addEventListener('click', function() {
                        const firebaseId = this.closest('tr').dataset.firebaseId;
                        showOrderDetails(firebaseId);
                    });
                });
                
                // Add event listeners to delete buttons
                document.querySelectorAll('.delete-order').forEach(button => {
                    button.addEventListener('click', function() {
                        const orderId = this.dataset.order;
                        if (confirm(`Are you sure you want to delete order ${this.closest('tr').dataset.orderId}?`)) {
                            deleteOrder(orderId);
                        }
                    });
                });
                
                // Add event listeners to status selectors
                document.querySelectorAll('.status-select').forEach(select => {
                    select.addEventListener('change', function() {
                        const orderId = this.dataset.order;
                        const newStatus = this.value;
                        updateOrderStatus(orderId, newStatus);
                    });
                });
                
                // Add event listeners to PDF export buttons
                document.querySelectorAll('.export-order-pdf').forEach(button => {
                    button.addEventListener('click', function() {
                        const firebaseId = this.dataset.order;
                        exportOrderToPDF(firebaseId);
                    });
                });
            }
            
            function showOrderDetails(firebaseId) {
                const orderDetails = document.createElement('div');
                orderDetails.id = 'supplierOrderDetails';
                orderDetails.style.position = 'fixed';
                orderDetails.style.top = '0';
                orderDetails.style.left = '0';
                orderDetails.style.width = '100%';
                orderDetails.style.height = '100%';
                orderDetails.style.backgroundColor = 'white';
                orderDetails.style.padding = '20px';
                orderDetails.style.zIndex = '1000';
                orderDetails.style.overflow = 'auto';
                orderDetails.innerHTML = '<div class="loading">Loading order details...</div>';
                document.body.appendChild(orderDetails);
                
                database.ref('supplierOrders/' + firebaseId).once('value')
                    .then((snapshot) => {
                        const order = snapshot.val();
                        renderOrderDetails(order, orderDetails);
                    })
                    .catch(error => {
                        orderDetails.innerHTML = `<div class="alert">Error loading order: ${error.message}</div>`;
                    });
            }
            
            function renderOrderDetails(order, container) {
                container.innerHTML = `
                    <div class="order-header">
                        <h2>Order Details: ${order.orderNumber}</h2>
                        <div>
                            <button class="btn btn-primary" id="closeOrderDetails">
                                <i class="fas fa-arrow-left"></i> Back to List
                            </button>
                            <button class="btn btn-warning" id="exportCurrentOrderToPdf">
                                <i class="fas fa-file-pdf"></i> Export to PDF
                            </button>
                        </div>
                    </div>
                    
                    <div class="order-header">
                        <div class="order-info">
                            <div>
                                <span>Order Date:</span>
                                <span>${new Date(order.date).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span>Supplier:</span>
                                <span>${order.supplier}</span>
                            </div>
                            <div>
                                <span>Currency:</span>
                                <span>${order.currency}</span>
                            </div>
                            <div>
                                <span>Status:</span>
                                <span class="status ${order.status === 'shipped' ? 'shipped' : order.status === 'delivered' ? 'departed' : ''}">
                                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        <div class="order-info">
                            <div>
                                <span>Subtotal:</span>
                                <span>${order.currency} ${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div>
                                <span>Total:</span>
                                <span>${order.currency} ${order.total.toFixed(2)}</span>
                            </div>
                            <div>
                                <span>Amount Paid (MVR):</span>
                                <span>MVR ${order.amountPaid.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <h3>Order Items</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th>Quantity</th>
                                <th>Unit Price (${order.currency})</th>
                                <th>Total (${order.currency})</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.description}</td>
                                    <td>${item.quantity}</td>
                                    <td>${item.unitPrice.toFixed(2)}</td>
                                    <td>${item.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td colspan="3">Subtotal</td>
                                <td>${order.currency} ${order.subtotal.toFixed(2)}</td>
                            </tr>
                            <tr class="grand-total-row">
                                <td colspan="3">Grand Total</td>
                                <td>${order.currency} ${order.total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    ${order.notes ? `
                    <div class="notes">
                        <h3>Notes</h3>
                        <p>${order.notes}</p>
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 20px; display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Print Order</button>
                        <button class="btn btn-primary" id="closeOrderDetails">
                            <i class="fas fa-arrow-left"></i> Back to List
                        </button>
                    </div>
                `;
                
                // Add event listener to the export button
                document.getElementById('exportCurrentOrderToPdf').addEventListener('click', function() {
                    exportOrderToPDF(order.firebaseId || order.orderNumber);
                });
                
                // Add event listener to close button
                document.getElementById('closeOrderDetails').addEventListener('click', function() {
                    document.body.removeChild(container);
                });
            }
            
            function updateOrderStatus(orderId, newStatus) {
                database.ref('supplierOrders/' + orderId).update({
                    status: newStatus
                })
                .catch(error => {
                    alert('Error updating order status: ' + error.message);
                });
            }
            
            function deleteOrder(orderId) {
                database.ref('supplierOrders/' + orderId).remove()
                    .then(() => {
                        // The real-time listener will automatically update the table
                    })
                    .catch(error => {
                        alert('Error deleting order: ' + error.message);
                    });
            }
            
            function exportOrderToPDF(firebaseId) {
                database.ref('supplierOrders/' + firebaseId).once('value')
                    .then((snapshot) => {
                        const order = snapshot.val();
                        generateOrderPDF(order);
                    })
                    .catch(error => {
                        alert('Error exporting to PDF: ' + error.message);
                    });
            }
            
            function generateOrderPDF(order) {
                // Create a new jsPDF instance
                const doc = new jsPDF();
                
                // Add title
                doc.setFontSize(18);
                doc.setTextColor(40, 40, 40);
                doc.text(`Order Summary: ${order.orderNumber}`, 105, 15, { align: 'center' });
                
                // Add order details
                doc.setFontSize(12);
                doc.setTextColor(80, 80, 80);
                
                // Order info section
                doc.text(`Order Date: ${new Date(order.date).toLocaleDateString()}`, 14, 25);
                doc.text(`Supplier: ${order.supplier}`, 14, 32);
                doc.text(`Currency: ${order.currency}`, 14, 39);
                doc.text(`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`, 14, 46);
                
                // Add items table
                const itemsData = order.items.map(item => [
                    item.description,
                    item.quantity,
                    item.unitPrice.toFixed(2),
                    item.total.toFixed(2)
                ]);
                
                // Add subtotal and grand total rows
                itemsData.push([
                    { content: 'Subtotal', colSpan: 3, styles: { fontStyle: 'bold' } },
                    { content: order.subtotal.toFixed(2), styles: { fontStyle: 'bold' } }
                ]);
                
                itemsData.push([
                    { content: 'Grand Total', colSpan: 3, styles: { fontStyle: 'bold' } },
                    { content: order.total.toFixed(2), styles: { fontStyle: 'bold' } }
                ]);
                
                doc.autoTable({
                    startY: 55,
                    head: [['Item Description', 'Quantity', `Unit Price (${order.currency})`, `Total (${order.currency})`]],
                    body: itemsData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [52, 152, 219],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 'auto' },
                        2: { cellWidth: 'auto' },
                        3: { cellWidth: 'auto' }
                    },
                    styles: {
                        fontSize: 10,
                        cellPadding: 3,
                        overflow: 'linebreak'
                    },
                    margin: { left: 14 }
                });
                
                // Add payment information
                const finalY = doc.lastAutoTable.finalY + 10;
                doc.text(`Amount Paid (MVR): ${order.amountPaid.toFixed(2)}`, 14, finalY);
                
                // Add notes if available
                if (order.notes) {
                    doc.text('Notes:', 14, finalY + 10);
                    doc.text(order.notes, 20, finalY + 18, { maxWidth: 170 });
                }
                
                // Add footer
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
                
                // Save the PDF
                doc.save(`Order_${order.orderNumber}.pdf`);
            }
            
            function exportSupplierSummaryToPDF() {
                // Create a new jsPDF instance
                const doc = new jsPDF();
                
                // Add title
                doc.setFontSize(18);
                doc.setTextColor(40, 40, 40);
                doc.text('Supplier Orders Summary Report', 105, 15, { align: 'center' });
                
                // Add summary information
                doc.setFontSize(12);
                doc.setTextColor(80, 80, 80);
                
                const totalOrders = document.getElementById('totalOrders').textContent;
                const totalSubtotal = document.getElementById('totalSubtotal').textContent;
                const totalPaid = document.getElementById('totalPaid').textContent;
                
                doc.text(`Total Orders: ${totalOrders}`, 14, 25);
                doc.text(`Total Subtotal (MVR): ${totalSubtotal}`, 14, 32);
                doc.text(`Total Amount Paid (MVR): ${totalPaid}`, 14, 39);
                doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 46);
                
                // Get all orders from the table
                const orders = [];
                const rows = document.querySelectorAll('#supplierOrdersList tr');
                
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 5) {
                        orders.push({
                            date: cells[0].textContent,
                            orderNumber: cells[1].textContent,
                            supplier: cells[2].textContent,
                            subtotal: cells[3].textContent,
                            paid: cells[4].textContent,
                            status: cells[5].querySelector('select').value
                        });
                    }
                });
                
                // Add orders table
                const ordersData = orders.map(order => [
                    order.date,
                    order.orderNumber,
                    order.supplier,
                    order.subtotal,
                    order.paid,
                    order.status
                ]);
                
                // Add grand totals row
                const grandSubtotal = document.getElementById('supplierGrandSubtotal').textContent;
                const grandPaid = document.getElementById('supplierGrandPaid').textContent;
                
                ordersData.push([
                    { content: 'Grand Totals', colSpan: 2, styles: { fontStyle: 'bold' } },
                    '',
                    grandSubtotal,
                    grandPaid,
                    { content: '', styles: { fontStyle: 'bold' } }
                ]);
                
                doc.autoTable({
                    startY: 55,
                    head: [['Date', 'Order #', 'Supplier', 'Subtotal', 'Paid (MVR)', 'Status']],
                    body: ordersData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [52, 152, 219],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 'auto' },
                        2: { cellWidth: 'auto' },
                        3: { cellWidth: 'auto' },
                        4: { cellWidth: 'auto' },
                        5: { cellWidth: 'auto' }
                    },
                    styles: {
                        fontSize: 10,
                        cellPadding: 3,
                        overflow: 'linebreak'
                    },
                    margin: { left: 14 }
                });
                
                // Add footer
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
                
                // Save the PDF
                doc.save(`Supplier_Orders_Summary_${new Date().toISOString().slice(0,10)}.pdf`);
            }
            
            // ==============================================
            // EXPENSES MANAGEMENT FUNCTIONALITY
            // ==============================================
            const expenseItems = document.getElementById('expenseItems');
            const addExpenseItemBtn = document.getElementById('addExpenseItem');
            const submitExpenseBtn = document.getElementById('submitExpense');
            const deleteAllExpensesBtn = document.getElementById('deleteAllExpenses');
            const exportExpensesSummaryPdf = document.getElementById('exportExpensesSummaryPdf');
            const expenseWeightTotal = document.getElementById('expenseWeightTotal');
            const expenseClearenceTotal = document.getElementById('expenseClearenceTotal');
            const expenseTotal = document.getElementById('expenseTotal');
            const totalWeightPayment = document.getElementById('totalWeightPayment');
            const totalClearencePayment = document.getElementById('totalClearencePayment');
            
            // Add initial empty row
            addExpenseItemRow();
            
            // Add expense item row
            addExpenseItemBtn.addEventListener('click', addExpenseItemRow);
            
            // Submit expense
            submitExpenseBtn.addEventListener('click', submitExpense);
            
            // Delete all expenses
            deleteAllExpensesBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete ALL expenses? This cannot be undone.')) {
                    database.ref('expenses').remove()
                        .then(() => {
                            alert('All expenses have been deleted.');
                            loadExpenses(); // Refresh the view
                        })
                        .catch(error => {
                            alert('Error deleting expenses: ' + error.message);
                        });
                }
            });
            
            // Export summary to PDF
            exportExpensesSummaryPdf.addEventListener('click', exportExpensesSummaryToPDF);
            
            // Update expense totals when payments change
            totalWeightPayment.addEventListener('input', updateExpenseTotals);
            totalClearencePayment.addEventListener('input', updateExpenseTotals);
            
            function addExpenseItemRow() {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="text" class="item-name" placeholder="Item name"></td>
                    <td><input type="number" class="item-qty" min="1" value="1"></td>
                    <td>
                        <select class="item-category">
                            ${EXPENSE_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                    </td>
                    <td><button type="button" class="btn btn-danger remove-item"><i class="fas fa-times"></i></button></td>
                `;
                expenseItems.appendChild(row);
                
                // Add event listeners
                const removeBtn = row.querySelector('.remove-item');
                removeBtn.addEventListener('click', () => {
                    row.remove();
                });
            }
            
            function updateExpenseTotals() {
                const weightTotal = parseFloat(totalWeightPayment.value) || 0;
                const clearenceTotal = parseFloat(totalClearencePayment.value) || 0;
                const total = weightTotal + clearenceTotal;
                
                expenseWeightTotal.textContent = weightTotal.toFixed(2);
                expenseClearenceTotal.textContent = clearenceTotal.toFixed(2);
                expenseTotal.textContent = total.toFixed(2);
            }
            
            function submitExpense() {
                const expenseDate = document.getElementById('expenseDate').value;
                const orderNumber = document.getElementById('expenseOrderNumber').value;
                const category = document.getElementById('expenseCategory').value;
                const weightPayment = parseFloat(totalWeightPayment.value) || 0;
                const clearencePayment = parseFloat(totalClearencePayment.value) || 0;
                const notes = document.getElementById('expenseNotes').value;
                
                if (!expenseDate) {
                    alert('Please fill in all required fields');
                    return;
                }
                
                const rows = document.querySelectorAll('#expenseItems tr');
                if (rows.length === 0 && weightPayment === 0 && clearencePayment === 0) {
                    alert('Please add at least one item or payment');
                    return;
                }
                
                // Collect expense items
                const items = [];
                rows.forEach(row => {
                    const name = row.querySelector('.item-name').value;
                    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                    const category = row.querySelector('.item-category').value;
                    
                    if (name) {
                        items.push({
                            name: name,
                            quantity: qty,
                            category: category
                        });
                    }
                });
                
                // Calculate totals
                const total = weightPayment + clearencePayment;
                
                // Create expense object
                const expense = {
                    expenseNumber: generateExpenseNumber(),
                    date: expenseDate,
                    orderNumber: orderNumber || '',
                    category: category,
                    items: items,
                    weightPayment: weightPayment,
                    clearencePayment: clearencePayment,
                    total: total,
                    notes: notes,
                    timestamp: new Date().toISOString()
                };
                
                // Save to Firebase
                saveExpenseToFirebase(expense);
            }
            
            function generateExpenseNumber() {
                const now = new Date();
                return 'EXP-' + now.getFullYear() + 
                       String(now.getMonth() + 1).padStart(2, '0') + 
                       String(now.getDate()).padStart(2, '0') + '-' + 
                       String(Math.floor(Math.random() * 1000)).padStart(3, '0');
            }
            
            function saveExpenseToFirebase(expense) {
                const newExpenseRef = database.ref('expenses').push();
                newExpenseRef.set(expense)
                    .then(() => {
                        // Show success and switch to summary tab
                        alert(`Expense submitted successfully!\nExpense Number: ${expense.expenseNumber}`);
                        
                        // Switch to summary tab and load expenses
                        document.querySelector('#expensesManagement .sub-tab[data-subtab="expenses-summary"]').click();
                        
                        // Reset form
                        resetExpenseForm();
                    })
                    .catch(error => {
                        alert('Error saving expense: ' + error.message);
                    });
            }
            
            function resetExpenseForm() {
                document.getElementById('expenseDate').value = '';
                document.getElementById('expenseOrderNumber').value = '';
                document.getElementById('expenseCategory').value = 'REDBOX';
                document.getElementById('totalWeightPayment').value = '0.00';
                document.getElementById('totalClearencePayment').value = '0.00';
                document.getElementById('expenseNotes').value = '';
                expenseItems.innerHTML = '';
                addExpenseItemRow();
                updateExpenseTotals();
            }
            
            function loadExpenses() {
                const expensesList = document.getElementById('expensesList');
                const loadingIndicator = document.getElementById('expensesLoadingIndicator');
                const expensesTable = document.getElementById('expensesTable');
                const summaryTotals = document.getElementById('expensesSummaryTotals');
                
                // Show loading indicator
                loadingIndicator.style.display = 'block';
                expensesTable.style.display = 'none';
                summaryTotals.style.display = 'none';
                
                // Listen for real-time updates from Firebase
                database.ref('expenses').on('value', (snapshot) => {
                    const expenses = [];
                    let totalWeight = 0;
                    let totalClearence = 0;
                    let totalAmount = 0;
                    
                    snapshot.forEach((childSnapshot) => {
                        const expense = childSnapshot.val();
                        expense.firebaseId = childSnapshot.key; // Store Firebase ID for updates
                        expenses.push(expense);
                        
                        // Calculate totals
                        totalWeight += expense.weightPayment || 0;
                        totalClearence += expense.clearencePayment || 0;
                        totalAmount += expense.total || 0;
                    });
                    
                    // Update summary totals
                    document.getElementById('totalExpenses').textContent = expenses.length;
                    document.getElementById('totalWeight').textContent = totalWeight.toFixed(2);
                    document.getElementById('totalClearence').textContent = totalClearence.toFixed(2);
                    document.getElementById('totalExpensesAmount').textContent = totalAmount.toFixed(2);
                    
                    if (expenses.length === 0) {
                        expensesList.innerHTML = '<tr><td colspan="7" style="text-align: center;">No expenses found</td></tr>';
                    } else {
                        renderExpensesTable(expenses);
                    }
                    
                    // Hide loading indicator and show table and totals
                    loadingIndicator.style.display = 'none';
                    expensesTable.style.display = 'table';
                    summaryTotals.style.display = 'grid';
                });
            }
            
            function renderExpensesTable(expenses) {
                const expensesList = document.getElementById('expensesList');
                
                // Sort expenses by date (newest first)
                expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // Calculate grand totals
                let grandWeight = 0;
                let grandClearence = 0;
                let grandTotal = 0;
                
                // Render expenses table
                expensesList.innerHTML = expenses.map(expense => {
                    // Add to grand totals
                    grandWeight += expense.weightPayment || 0;
                    grandClearence += expense.clearencePayment || 0;
                    grandTotal += expense.total || 0;
                    
                    return `
                        <tr data-expense-id="${expense.expenseNumber}" data-firebase-id="${expense.firebaseId}">
                            <td>${new Date(expense.date).toLocaleDateString()}</td>
                            <td>${expense.expenseNumber}</td>
                            <td>${expense.orderNumber || 'N/A'}</td>
                            <td>${expense.weightPayment.toFixed(2)}</td>
                            <td>${expense.clearencePayment.toFixed(2)}</td>
                            <td>${expense.total.toFixed(2)}</td>
                            <td>
                                <button class="btn btn-primary view-expense"><i class="fas fa-eye"></i> Details</button>
                                <button class="btn btn-danger delete-expense" data-expense="${expense.firebaseId}"><i class="fas fa-trash-alt"></i> Delete</button>
                                <button class="btn btn-warning export-expense-pdf" data-expense="${expense.firebaseId}"><i class="fas fa-file-pdf"></i> PDF</button>
                            </td>
                        </tr>
                    `;
                }).join('');
                
                // Update grand totals row
                document.getElementById('expensesGrandWeight').textContent = grandWeight.toFixed(2);
                document.getElementById('expensesGrandClearence').textContent = grandClearence.toFixed(2);
                document.getElementById('expensesGrandTotal').textContent = grandTotal.toFixed(2);
                
                // Add event listeners to view buttons
                document.querySelectorAll('.view-expense').forEach(button => {
                    button.addEventListener('click', function() {
                        const firebaseId = this.closest('tr').dataset.firebaseId;
                        showExpenseDetails(firebaseId);
                    });
                });
                
                // Add event listeners to delete buttons
                document.querySelectorAll('.delete-expense').forEach(button => {
                    button.addEventListener('click', function() {
                        const expenseId = this.dataset.expense;
                        if (confirm(`Are you sure you want to delete expense ${this.closest('tr').dataset.expenseId}?`)) {
                            deleteExpense(expenseId);
                        }
                    });
                });
                
                // Add event listeners to PDF export buttons
                document.querySelectorAll('.export-expense-pdf').forEach(button => {
                    button.addEventListener('click', function() {
                        const firebaseId = this.dataset.expense;
                        exportExpenseToPDF(firebaseId);
                    });
                });
            }
            
            function showExpenseDetails(firebaseId) {
                const expenseDetails = document.createElement('div');
                expenseDetails.id = 'expenseDetails';
                expenseDetails.style.position = 'fixed';
                expenseDetails.style.top = '0';
                expenseDetails.style.left = '0';
                expenseDetails.style.width = '100%';
                expenseDetails.style.height = '100%';
                expenseDetails.style.backgroundColor = 'white';
                expenseDetails.style.padding = '20px';
                expenseDetails.style.zIndex = '1000';
                expenseDetails.style.overflow = 'auto';
                expenseDetails.innerHTML = '<div class="loading">Loading expense details...</div>';
                document.body.appendChild(expenseDetails);
                
                database.ref('expenses/' + firebaseId).once('value')
                    .then((snapshot) => {
                        const expense = snapshot.val();
                        renderExpenseDetails(expense, expenseDetails);
                    })
                    .catch(error => {
                        expenseDetails.innerHTML = `<div class="alert">Error loading expense: ${error.message}</div>`;
                    });
            }
            
            function renderExpenseDetails(expense, container) {
                container.innerHTML = `
                    <div class="expense-header">
                        <h2>Expense Details: ${expense.expenseNumber}</h2>
                        <div>
                            <button class="btn btn-primary" id="closeExpenseDetails">
                                <i class="fas fa-arrow-left"></i> Back to List
                            </button>
                            <button class="btn btn-warning" id="exportCurrentExpenseToPdf">
                                <i class="fas fa-file-pdf"></i> Export to PDF
                            </button>
                        </div>
                    </div>
                    
                    <div class="expense-header">
                        <div class="expense-info">
                            <div>
                                <span>Expense Date:</span>
                                <span>${new Date(expense.date).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span>Order Number:</span>
                                <span>${expense.orderNumber || 'N/A'}</span>
                            </div>
                            <div>
                                <span>Category:</span>
                                <span>${expense.category}</span>
                            </div>
                        </div>
                        <div class="expense-info">
                            <div>
                                <span>Weight Payment (MVR):</span>
                                <span>${expense.weightPayment.toFixed(2)}</span>
                            </div>
                            <div>
                                <span>Clearence Payment (MVR):</span>
                                <span>${expense.clearencePayment.toFixed(2)}</span>
                            </div>
                            <div>
                                <span>Total (MVR):</span>
                                <span>${expense.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${expense.items.length > 0 ? `
                    <h3>Expense Items</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expense.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${item.category}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ` : ''}
                    
                    ${expense.notes ? `
                    <div class="notes">
                        <h3>Notes</h3>
                        <p>${expense.notes}</p>
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 20px; display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Print Expense</button>
                        <button class="btn btn-primary" id="closeExpenseDetails">
                            <i class="fas fa-arrow-left"></i> Back to List
                        </button>
                    </div>
                `;
                
                // Add event listener to the export button
                document.getElementById('exportCurrentExpenseToPdf').addEventListener('click', function() {
                    exportExpenseToPDF(expense.firebaseId || expense.expenseNumber);
                });
                
                // Add event listener to close button
                document.getElementById('closeExpenseDetails').addEventListener('click', function() {
                    document.body.removeChild(container);
                });
            }
            
            function deleteExpense(expenseId) {
                database.ref('expenses/' + expenseId).remove()
                    .then(() => {
                        // The real-time listener will automatically update the table
                    })
                    .catch(error => {
                        alert('Error deleting expense: ' + error.message);
                    });
            }
            
            function exportExpenseToPDF(firebaseId) {
                database.ref('expenses/' + firebaseId).once('value')
                    .then((snapshot) => {
                        const expense = snapshot.val();
                        generateExpensePDF(expense);
                    })
                    .catch(error => {
                        alert('Error exporting to PDF: ' + error.message);
                    });
            }
            
            function generateExpensePDF(expense) {
                // Create a new jsPDF instance
                const doc = new jsPDF();
                
                // Add title
                doc.setFontSize(18);
                doc.setTextColor(40, 40, 40);
                doc.text(`Expense Summary: ${expense.expenseNumber}`, 105, 15, { align: 'center' });
                
                // Add expense details
                doc.setFontSize(12);
                doc.setTextColor(80, 80, 80);
                
                // Expense info section
                doc.text(`Expense Date: ${new Date(expense.date).toLocaleDateString()}`, 14, 25);
                doc.text(`Order Number: ${expense.orderNumber || 'N/A'}`, 14, 32);
                doc.text(`Category: ${expense.category}`, 14, 39);
                
                // Add payment information
                doc.text(`Weight Payment (MVR): ${expense.weightPayment.toFixed(2)}`, 14, 46);
                doc.text(`Clearence Payment (MVR): ${expense.clearencePayment.toFixed(2)}`, 14, 53);
                doc.text(`Total (MVR): ${expense.total.toFixed(2)}`, 14, 60);
                
                // Add items table if there are items
                if (expense.items.length > 0) {
                    const itemsData = expense.items.map(item => [
                        item.name,
                        item.quantity,
                        item.category
                    ]);
                    
                    doc.autoTable({
                        startY: 70,
                        head: [['Item Name', 'Quantity', 'Category']],
                        body: itemsData,
                        theme: 'grid',
                        headStyles: {
                            fillColor: [52, 152, 219],
                            textColor: 255,
                            fontStyle: 'bold'
                        },
                        columnStyles: {
                            0: { cellWidth: 'auto' },
                            1: { cellWidth: 'auto' },
                            2: { cellWidth: 'auto' }
                        },
                        styles: {
                            fontSize: 10,
                            cellPadding: 3,
                            overflow: 'linebreak'
                        },
                        margin: { left: 14 }
                    });
                }
                
                // Add notes if available
                if (expense.notes) {
                    const finalY = expense.items.length > 0 ? doc.lastAutoTable.finalY + 10 : 70;
                    doc.text('Notes:', 14, finalY);
                    doc.text(expense.notes, 20, finalY + 8, { maxWidth: 170 });
                }
                
                // Add footer
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
                
                // Save the PDF
                doc.save(`Expense_${expense.expenseNumber}.pdf`);
            }
            
            function exportExpensesSummaryToPDF() {
                // Create a new jsPDF instance
                const doc = new jsPDF();
                
                // Add title
                doc.setFontSize(18);
                doc.setTextColor(40, 40, 40);
                doc.text('Expenses Summary Report', 105, 15, { align: 'center' });
                
                // Add summary information
                doc.setFontSize(12);
                doc.setTextColor(80, 80, 80);
                
                const totalExpenses = document.getElementById('totalExpenses').textContent;
                const totalWeight = document.getElementById('totalWeight').textContent;
                const totalClearence = document.getElementById('totalClearence').textContent;
                const totalAmount = document.getElementById('totalExpensesAmount').textContent;
                
                doc.text(`Total Expenses: ${totalExpenses}`, 14, 25);
                doc.text(`Total Weight (MVR): ${totalWeight}`, 14, 32);
                doc.text(`Total Clearence (MVR): ${totalClearence}`, 14, 39);
                doc.text(`Total Amount (MVR): ${totalAmount}`, 14, 46);
                doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 53);
                
                // Get all expenses from the table
                const expenses = [];
                const rows = document.querySelectorAll('#expensesList tr');
                
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 6) {
                        expenses.push({
                            date: cells[0].textContent,
                            expenseNumber: cells[1].textContent,
                            orderNumber: cells[2].textContent,
                            weight: cells[3].textContent,
                            clearence: cells[4].textContent,
                            total: cells[5].textContent
                        });
                    }
                });
                
                // Add expenses table
                const expensesData = expenses.map(expense => [
                    expense.date,
                    expense.expenseNumber,
                    expense.orderNumber,
                    expense.weight,
                    expense.clearence,
                    expense.total
                ]);
                
                // Add grand totals row
                const grandWeight = document.getElementById('expensesGrandWeight').textContent;
                const grandClearence = document.getElementById('expensesGrandClearence').textContent;
                const grandTotal = document.getElementById('expensesGrandTotal').textContent;
                
                expensesData.push([
                    { content: 'Grand Totals', colSpan: 2, styles: { fontStyle: 'bold' } },
                    '',
                    grandWeight,
                    grandClearence,
                    { content: grandTotal, styles: { fontStyle: 'bold' } }
                ]);
                
                doc.autoTable({
                    startY: 65,
                    head: [['Date', 'Expense #', 'Order #', 'Weight', 'Clearence', 'Total']],
                    body: expensesData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [52, 152, 219],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 'auto' },
                        2: { cellWidth: 'auto' },
                        3: { cellWidth: 'auto' },
                        4: { cellWidth: 'auto' },
                        5: { cellWidth: 'auto' }
                    },
                    styles: {
                        fontSize: 10,
                        cellPadding: 3,
                        overflow: 'linebreak'
                    },
                    margin: { left: 14 }
                });
                
                // Add footer
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
                
                // Save the PDF
                doc.save(`Expenses_Summary_${new Date().toISOString().slice(0,10)}.pdf`);
            }
            
            // ==============================================
            // SALES MANAGEMENT FUNCTIONALITY (Updated with Item Code)
            // ==============================================
            const saleItems = document.getElementById('saleItems');
            const addSaleItemBtn = document.getElementById('addSaleItem');
            const submitSaleBtn = document.getElementById('submitSale');
            const deleteAllSalesBtn = document.getElementById('deleteAllSales');
            const exportSalesSummaryPdf = document.getElementById('exportSalesSummaryPdf');
            const saleSubtotalCell = document.getElementById('saleSubtotal');
            const saleGrandTotalCell = document.getElementById('saleGrandTotal');
            const analyzeSalesBtn = document.getElementById('analyzeSales');
            
            // Add initial empty row
            addSaleItemRow();
            
            // Add sale item row
            addSaleItemBtn.addEventListener('click', addSaleItemRow);
            
            // Submit sale
            submitSaleBtn.addEventListener('click', submitSale);
            
            // Delete all sales
            deleteAllSalesBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete ALL sales? This cannot be undone.')) {
                    database.ref('sales').remove()
                        .then(() => {
                            alert('All sales have been deleted.');
                            loadSales(); // Refresh the view
                        })
                        .catch(error => {
                            alert('Error deleting sales: ' + error.message);
                        });
                }
            });
            
            // Export summary to PDF
            exportSalesSummaryPdf.addEventListener('click', exportSalesSummaryToPDF);
            
            // Analyze sales button
            analyzeSalesBtn.addEventListener('click', analyzeSales);
            
            function addSaleItemRow() {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <input type="text" class="item-code" placeholder="Item Code">
                    </td>
                    <td>
                        <select class="item-select">
                            <option value="">-- Select Item --</option>
                            <!-- Items will be populated from stock -->
                        </select>
                    </td>
                    <td class="current-stock">0</td>
                    <td><input type="number" class="item-price" min="0" step="0.01" value="0.00"></td>
                    <td><input type="number" class="item-qty" min="1" value="1"></td>
                    <td class="item-total">MVR 0.00</td>
                    <td><button type="button" class="btn btn-danger remove-item"><i class="fas fa-times"></i></button></td>
                `;
                saleItems.appendChild(row);
                
                // Populate items from stock
                populateStockItems(row);
                
                // Add event listeners
                const select = row.querySelector('.item-select');
                const codeInput = row.querySelector('.item-code');
                const priceInput = row.querySelector('.item-price');
                const qtyInput = row.querySelector('.item-qty');
                const removeBtn = row.querySelector('.remove-item');
                
                select.addEventListener('change', function() {
                    updateStockInfo(row);
                    calculateSaleRowTotal(row);
                });
                
                // Auto-fill item code when item is selected
                select.addEventListener('change', function() {
                    const selectedOption = this.options[this.selectedIndex];
                    if (selectedOption.dataset.code) {
                        codeInput.value = selectedOption.dataset.code;
                    }
                });
                
                priceInput.addEventListener('input', () => calculateSaleRowTotal(row));
                qtyInput.addEventListener('input', () => calculateSaleRowTotal(row));
                removeBtn.addEventListener('click', () => {
                    row.remove();
                    updateSaleTotals();
                });
                
                calculateSaleRowTotal(row);
            }
            
            function populateStockItems(row) {
                database.ref('stock').once('value')
                    .then((snapshot) => {
                        const select = row.querySelector('.item-select');
                        select.innerHTML = '<option value="">-- Select Item --</option>';
                        
                        snapshot.forEach((childSnapshot) => {
                            const stockItem = childSnapshot.val();
                            const option = document.createElement('option');
                            option.value = stockItem.itemName;
                            option.textContent = stockItem.itemName;
                            option.dataset.stockId = childSnapshot.key;
                            option.dataset.code = stockItem.itemCode || '';
                            select.appendChild(option);
                        });
                    })
                    .catch(error => {
                        console.error('Error loading stock items:', error);
                    });
            }
            
            function updateStockInfo(row) {
                const select = row.querySelector('.item-select');
                const selectedItem = select.options[select.selectedIndex];
                const stockId = selectedItem.dataset.stockId;
                
                if (stockId) {
                    database.ref('stock/' + stockId).once('value')
                        .then((snapshot) => {
                            const stockItem = snapshot.val();
                            row.querySelector('.current-stock').textContent = stockItem.quantity;
                            row.querySelector('.item-price').value = stockItem.price.toFixed(2);
                            calculateSaleRowTotal(row);
                        })
                        .catch(error => {
                            console.error('Error loading stock item:', error);
                        });
                } else {
                    row.querySelector('.current-stock').textContent = '0';
                    row.querySelector('.item-price').value = '0.00';
                    calculateSaleRowTotal(row);
                }
            }
            
            function calculateSaleRowTotal(row) {
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                const total = price * qty;
                row.querySelector('.item-total').textContent = `MVR ${total.toFixed(2)}`;
                updateSaleTotals();
            }
            
            function updateSaleTotals() {
                const rows = document.querySelectorAll('#saleItems tr');
                let subtotal = 0;
                
                rows.forEach(row => {
                    const totalText = row.querySelector('.item-total').textContent;
                    subtotal += parseFloat(totalText.replace('MVR', '')) || 0;
                });
                
                saleSubtotalCell.textContent = `MVR ${subtotal.toFixed(2)}`;
                saleGrandTotalCell.textContent = `MVR ${subtotal.toFixed(2)}`;
            }
            
            function submitSale() {
                const saleDate = document.getElementById('saleDate').value;
                const customerName = document.getElementById('customerName').value;
                const customerContact = document.getElementById('customerContact').value;
                const notes = document.getElementById('saleNotes').value;
                
                if (!saleDate) {
                    alert('Please fill in all required fields');
                    return;
                }
                
                const rows = document.querySelectorAll('#saleItems tr');
                if (rows.length === 0) {
                    alert('Please add at least one item');
                    return;
                }
                
                // Collect sale items
                const items = [];
                let allItemsValid = true;
                
                rows.forEach(row => {
                    const select = row.querySelector('.item-select');
                    const itemName = select.options[select.selectedIndex].text;
                    const itemCode = row.querySelector('.item-code').value || '';
                    const stockId = select.options[select.selectedIndex].dataset.stockId;
                    const price = parseFloat(row.querySelector('.item-price').value) || 0;
                    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                    const currentStock = parseInt(row.querySelector('.current-stock').textContent) || 0;
                    
                    if (!itemName || itemName === '-- Select Item --') {
                        allItemsValid = false;
                        return;
                    }
                    
                    if (qty > currentStock) {
                        alert(`Not enough stock for ${itemName}. Available: ${currentStock}, Requested: ${qty}`);
                        allItemsValid = false;
                        return;
                    }
                    
                    if (price <= 0 || qty <= 0) {
                        allItemsValid = false;
                        return;
                    }
                    
                    items.push({
                        itemCode: itemCode,
                        itemName: itemName,
                        stockId: stockId,
                        price: price,
                        quantity: qty,
                        total: price * qty
                    });
                });
                
                if (!allItemsValid || items.length === 0) {
                    alert('Please add valid items with quantities and prices');
                    return;
                }
                
                // Calculate totals
                const subtotal = items.reduce((sum, item) => sum + item.total, 0);
                
                // Create sale object
                const sale = {
                    saleNumber: generateSaleNumber(),
                    date: saleDate,
                    customerName: customerName || '',
                    customerContact: customerContact || '',
                    items: items,
                    subtotal: subtotal,
                    total: subtotal,
                    notes: notes,
                    timestamp: new Date().toISOString()
                };
                
                // Save to Firebase and update stock
                saveSaleToFirebase(sale);
            }
            
            function generateSaleNumber() {
                const now = new Date();
                return 'SALE-' + now.getFullYear() + 
                       String(now.getMonth() + 1).padStart(2, '0') + 
                       String(now.getDate()).padStart(2, '0') + '-' + 
                       String(Math.floor(Math.random() * 1000)).padStart(3, '0');
            }
            
            function saveSaleToFirebase(sale) {
                // First update stock quantities
                const stockUpdates = {};
                sale.items.forEach(item => {
                    if (item.stockId) {
                        stockUpdates[item.stockId] = {
                            quantity: firebase.database.ServerValue.increment(-item.quantity)
                        };
                    }
                });
                
                // Update stock quantities
                if (Object.keys(stockUpdates).length > 0) {
                    database.ref('stock').update(stockUpdates)
                        .then(() => {
                            // Then save the sale
                            const newSaleRef = database.ref('sales').push();
                            return newSaleRef.set(sale);
                        })
                        .then(() => {
                            // Show success and switch to summary tab
                            alert(`Sale submitted successfully!\nSale Number: ${sale.saleNumber}`);
                            
                            // Switch to summary tab and load sales
                            document.querySelector('#salesManagement .sub-tab[data-subtab="sales-summary"]').click();
                            
                            // Reset form
                            resetSaleForm();
                        })
                        .catch(error => {
                            alert('Error saving sale: ' + error.message);
                        });
                } else {
                    // Save sale without stock updates (shouldn't happen as we validate stock)
                    const newSaleRef = database.ref('sales').push();
                    newSaleRef.set(sale)
                        .then(() => {
                            // Show success and switch to summary tab
                            alert(`Sale submitted successfully!\nSale Number: ${sale.saleNumber}`);
                            
                            // Switch to summary tab and load sales
                            document.querySelector('#salesManagement .sub-tab[data-subtab="sales-summary"]').click();
                            
                            // Reset form
                            resetSaleForm();
                        })
                        .catch(error => {
                            alert('Error saving sale: ' + error.message);
                        });
                }
            }
            
            function resetSaleForm() {
                document.getElementById('saleDate').value = '';
                document.getElementById('customerName').value = '';
                document.getElementById('customerContact').value = '';
                document.getElementById('saleNotes').value = '';
                saleItems.innerHTML = '';
                addSaleItemRow();
            }
            
            function loadSales() {
                const salesList = document.getElementById('salesList');
                const loadingIndicator = document.getElementById('salesLoadingIndicator');
                const salesTable = document.getElementById('salesTable');
                const summaryTotals = document.getElementById('salesSummaryTotals');
                
                // Show loading indicator
                loadingIndicator.style.display = 'block';
                salesTable.style.display = 'none';
                summaryTotals.style.display = 'none';
                
                // Listen for real-time updates from Firebase
                database.ref('sales').on('value', (snapshot) => {
                    const sales = [];
                    let totalRevenue = 0;
                    let totalItemsSold = 0;
                    
                    snapshot.forEach((childSnapshot) => {
                        const sale = childSnapshot.val();
                        sale.firebaseId = childSnapshot.key; // Store Firebase ID for updates
                        sales.push(sale);
                        
                        // Calculate totals
                        totalRevenue += sale.total || 0;
                        totalItemsSold += sale.items.reduce((sum, item) => sum + item.quantity, 0);
                    });
                    
                    // Update summary totals
                    document.getElementById('totalSales').textContent = sales.length;
                    document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
                    document.getElementById('totalItemsSold').textContent = totalItemsSold;
                    
                    if (sales.length === 0) {
                        salesList.innerHTML = '<tr><td colspan="6" style="text-align: center;">No sales found</td></tr>';
                    } else {
                        renderSalesTable(sales);
                    }
                    
                    // Hide loading indicator and show table and totals
                    loadingIndicator.style.display = 'none';
                    salesTable.style.display = 'table';
                    summaryTotals.style.display = 'grid';
                });
            }
            
            function renderSalesTable(sales) {
                const salesList = document.getElementById('salesList');
                
                // Sort sales by date (newest first)
                sales.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // Calculate grand totals
                let grandTotal = 0;
                
                // Render sales table
                salesList.innerHTML = sales.map(sale => {
                    // Add to grand totals
                    grandTotal += sale.total || 0;
                    
                    return `
                        <tr data-sale-id="${sale.saleNumber}" data-firebase-id="${sale.firebaseId}">
                            <td>${new Date(sale.date).toLocaleDateString()}</td>
                            <td>${sale.saleNumber}</td>
                            <td>${sale.customerName || 'N/A'}</td>
                            <td>${sale.items.length} items</td>
                            <td>MVR ${sale.total.toFixed(2)}</td>
                            <td>
                                <button class="btn btn-primary view-sale"><i class="fas fa-eye"></i> Summary</button>
                                <button class="btn btn-danger delete-sale" data-sale="${sale.firebaseId}"><i class="fas fa-trash-alt"></i> Delete</button>
                                <button class="btn btn-warning export-sale-pdf" data-sale="${sale.firebaseId}"><i class="fas fa-file-pdf"></i> PDF</button>
                            </td>
                        </tr>
                    `;
                }).join('');
                
                // Update grand totals row
                document.getElementById('salesGrandTotal').textContent = `MVR ${grandTotal.toFixed(2)}`;
                
                // Add event listeners to view buttons
                document.querySelectorAll('.view-sale').forEach(button => {
                    button.addEventListener('click', function() {
                        const firebaseId = this.closest('tr').dataset.firebaseId;
                        showSaleDetails(firebaseId);
                    });
                });
                
                // Add event listeners to delete buttons
                document.querySelectorAll('.delete-sale').forEach(button => {
                    button.addEventListener('click', function() {
                        const saleId = this.dataset.sale;
                        if (confirm(`Are you sure you want to delete this sale?`)) {
                            deleteSale(saleId);
                        }
                    });
                });
                
                // Add event listeners to PDF export buttons
                document.querySelectorAll('.export-sale-pdf').forEach(button => {
                    button.addEventListener('click', function() {
                        const firebaseId = this.dataset.sale;
                        exportSaleToPDF(firebaseId);
                    });
                });
            }
            
            function showSaleDetails(firebaseId) {
                const saleDetails = document.createElement('div');
                saleDetails.id = 'saleDetails';
                saleDetails.style.position = 'fixed';
                saleDetails.style.top = '0';
                saleDetails.style.left = '0';
                saleDetails.style.width = '100%';
                saleDetails.style.height = '100%';
                saleDetails.style.backgroundColor = 'white';
                saleDetails.style.padding = '20px';
                saleDetails.style.zIndex = '1000';
                saleDetails.style.overflow = 'auto';
                saleDetails.innerHTML = '<div class="loading">Loading sale details...</div>';
                document.body.appendChild(saleDetails);
                
                database.ref('sales/' + firebaseId).once('value')
                    .then((snapshot) => {
                        const sale = snapshot.val();
                        renderSaleDetails(sale, saleDetails);
                    })
                    .catch(error => {
                        saleDetails.innerHTML = `<div class="alert">Error loading sale: ${error.message}</div>`;
                    });
            }
            
            function renderSaleDetails(sale, container) {
                container.innerHTML = `
                    <div class="sale-header">
                        <h2>Sale Details: ${sale.saleNumber}</h2>
                        <div>
                            <button class="btn btn-primary" id="closeSaleDetails">
                                <i class="fas fa-arrow-left"></i> Back to List
                            </button>
                            <button class="btn btn-warning" id="exportCurrentSaleToPdf">
                                <i class="fas fa-file-pdf"></i> Export to PDF
                            </button>
                        </div>
                    </div>
                    
                    <div class="sale-header">
                        <div class="sale-info">
                            <div>
                                <span>Sale Date:</span>
                                <span>${new Date(sale.date).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span>Customer Name:</span>
                                <span>${sale.customerName || 'N/A'}</span>
                            </div>
                            <div>
                                <span>Customer Contact:</span>
                                <span>${sale.customerContact || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <h3>Sale Items</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Item</th>
                                <th>Price (MVR)</th>
                                <th>Quantity</th>
                                <th>Total (MVR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sale.items.map(item => `
                                <tr>
                                    <td>${item.itemCode || 'N/A'}</td>
                                    <td>${item.itemName}</td>
                                    <td>${item.price.toFixed(2)}</td>
                                    <td>${item.quantity}</td>
                                    <td>${item.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td colspan="4">Subtotal</td>
                                <td>${sale.subtotal.toFixed(2)}</td>
                            </tr>
                            <tr class="grand-total-row">
                                <td colspan="4">Grand Total</td>
                                <td>${sale.total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    ${sale.notes ? `
                    <div class="notes">
                        <h3>Notes</h3>
                        <p>${sale.notes}</p>
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 20px; display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Print Sale</button>
                        <button class="btn btn-primary" id="closeSaleDetails">
                            <i class="fas fa-arrow-left"></i> Back to List
                        </button>
                    </div>
                `;
                
                // Add event listener to the export button
                document.getElementById('exportCurrentSaleToPdf').addEventListener('click', function() {
                    exportSaleToPDF(sale.firebaseId || sale.saleNumber);
                });
                
                // Add event listener to close button
                document.getElementById('closeSaleDetails').addEventListener('click', function() {
                    document.body.removeChild(container);
                });
            }
            
            function deleteSale(firebaseId) {
                // First get the sale to restore stock
                database.ref('sales/' + firebaseId).once('value')
                    .then((snapshot) => {
                        const sale = snapshot.val();
                        const stockUpdates = {};
                        
                        // Prepare stock updates to restore quantities
                        sale.items.forEach(item => {
                            if (item.stockId) {
                                stockUpdates[item.stockId] = {
                                    quantity: firebase.database.ServerValue.increment(item.quantity)
                                };
                            }
                        });
                        
                        // Update stock quantities
                        if (Object.keys(stockUpdates).length > 0) {
                            return database.ref('stock').update(stockUpdates)
                                .then(() => {
                                    // Then delete the sale
                                    return database.ref('sales/' + firebaseId).remove();
                                });
                        } else {
                            // Just delete the sale if no stock to restore
                            return database.ref('sales/' + firebaseId).remove();
                        }
                    })
                    .then(() => {
                        // The real-time listener will automatically update the table
                    })
                    .catch(error => {
                        alert('Error deleting sale: ' + error.message);
                    });
            }
            
            function exportSaleToPDF(firebaseId) {
                database.ref('sales/' + firebaseId).once('value')
                    .then((snapshot) => {
                        const sale = snapshot.val();
                        generateSalePDF(sale);
                    })
                    .catch(error => {
                        alert('Error exporting to PDF: ' + error.message);
                    });
            }
            
            function generateSalePDF(sale) {
                // Create a new jsPDF instance
                const doc = new jsPDF();
                
                // Add title
                doc.setFontSize(18);
                doc.setTextColor(40, 40, 40);
                doc.text(`Sale Summary: ${sale.saleNumber}`, 105, 15, { align: 'center' });
                
                // Add sale details
                doc.setFontSize(12);
                doc.setTextColor(80, 80, 80);
                
                // Sale info section
                doc.text(`Sale Date: ${new Date(sale.date).toLocaleDateString()}`, 14, 25);
                doc.text(`Customer Name: ${sale.customerName || 'N/A'}`, 14, 32);
                doc.text(`Customer Contact: ${sale.customerContact || 'N/A'}`, 14, 39);
                
                // Add items table
                const itemsData = sale.items.map(item => [
                    item.itemCode || 'N/A',
                    item.itemName,
                    item.price.toFixed(2),
                    item.quantity,
                    item.total.toFixed(2)
                ]);
                
                // Add subtotal and grand total rows
                itemsData.push([
                    { content: 'Subtotal', colSpan: 4, styles: { fontStyle: 'bold' } },
                    { content: sale.subtotal.toFixed(2), styles: { fontStyle: 'bold' } }
                ]);
                
                itemsData.push([
                    { content: 'Grand Total', colSpan: 4, styles: { fontStyle: 'bold' } },
                    { content: sale.total.toFixed(2), styles: { fontStyle: 'bold' } }
                ]);
                
                doc.autoTable({
                    startY: 45,
                    head: [['Item Code', 'Item', 'Price (MVR)', 'Quantity', 'Total (MVR)']],
                    body: itemsData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [52, 152, 219],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 'auto' },
                        2: { cellWidth: 'auto' },
                        3: { cellWidth: 'auto' },
                        4: { cellWidth: 'auto' }
                    },
                    styles: {
                        fontSize: 10,
                        cellPadding: 3,
                        overflow: 'linebreak'
                    },
                    margin: { left: 14 }
                });
                
                // Add notes if available
                if (sale.notes) {
                    const finalY = doc.lastAutoTable.finalY + 10;
                    doc.text('Notes:', 14, finalY);
                    doc.text(sale.notes, 20, finalY + 8, { maxWidth: 170 });
                }
                
                // Add footer
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
                
                // Save the PDF
                doc.save(`Sale_${sale.saleNumber}.pdf`);
            }
            
            function exportSalesSummaryToPDF() {
                // Create a new jsPDF instance
                const doc = new jsPDF();
                
                // Add title
                doc.setFontSize(18);
                doc.setTextColor(40, 40, 40);
                doc.text('Sales Summary Report', 105, 15, { align: 'center' });
                
                // Add summary information
                doc.setFontSize(12);
                doc.setTextColor(80, 80, 80);
                
                const totalSales = document.getElementById('totalSales').textContent;
                const totalRevenue = document.getElementById('totalRevenue').textContent;
                const totalItemsSold = document.getElementById('totalItemsSold').textContent;
                
                doc.text(`Total Sales: ${totalSales}`, 14, 25);
                doc.text(`Total Revenue (MVR): ${totalRevenue}`, 14, 32);
                doc.text(`Total Items Sold: ${totalItemsSold}`, 14, 39);
                doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 46);
                
                // Get all sales from the table
                const sales = [];
                const rows = document.querySelectorAll('#salesList tr');
                
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 5) {
                        sales.push({
                            date: cells[0].textContent,
                            saleNumber: cells[1].textContent,
                            customerName: cells[2].textContent,
                            itemsCount: cells[3].textContent,
                            total: cells[4].textContent
                        });
                    }
                });
                
                // Add sales table
                const salesData = sales.map(sale => [
                    sale.date,
                    sale.saleNumber,
                    sale.customerName,
                    sale.itemsCount,
                    sale.total
                ]);
                
                // Add grand totals row
                const grandTotal = document.getElementById('salesGrandTotal').textContent;
                
                salesData.push([
                    { content: 'Grand Totals', colSpan: 3, styles: { fontStyle: 'bold' } },
                    '',
                    { content: grandTotal, styles: { fontStyle: 'bold' } }
                ]);
                
                doc.autoTable({
                    startY: 55,
                    head: [['Date', 'Sale #', 'Customer', 'Items', 'Total (MVR)']],
                    body: salesData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [52, 152, 219],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 'auto' },
                        2: { cellWidth: 'auto' },
                        3: { cellWidth: 'auto' },
                        4: { cellWidth: 'auto' }
                    },
                    styles: {
                        fontSize: 10,
                        cellPadding: 3,
                        overflow: 'linebreak'
                    },
                    margin: { left: 14 }
                });
                
                // Add footer
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
                
                // Save the PDF
                doc.save(`Sales_Summary_${new Date().toISOString().slice(0,10)}.pdf`);
            }
            







            // Replace the existing analyzeSales function with this code
function analyzeSales() {
    const startDate = document.getElementById('analysisStartDate').value;
    const endDate = document.getElementById('analysisEndDate').value;
    const itemFilter = document.getElementById('analysisItemCode').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    const loadingIndicator = document.getElementById('salesAnalysisLoading');
    const resultsTable = document.getElementById('salesAnalysisTable');
    const resultsList = document.getElementById('salesAnalysisList');

    loadingIndicator.style.display = 'block';
    resultsTable.style.display = 'none';

    database.ref('sales').once('value')
        .then((snapshot) => {
            const sales = [];
            const itemAnalysis = {};
            let totalRevenue = 0;
            
            // Collect all sales within the date range
            snapshot.forEach((childSnapshot) => {
                const sale = childSnapshot.val();
                const saleDate = new Date(sale.date);
                const start = new Date(startDate);
                const end = new Date(endDate);
                
                if (saleDate >= start && saleDate <= end) {
                    sales.push(sale);
                    
                    // Process each item in the sale
                    sale.items.forEach(item => {
                        // Apply item filter if not "ALL"
                        if (itemFilter !== 'ALL' && item.itemCode !== itemFilter) {
                            return;
                        }
                        
                        // Initialize item in analysis if not exists
                        if (!itemAnalysis[item.itemName]) {
                            itemAnalysis[item.itemName] = {
                                itemCode: item.itemCode || 'N/A',
                                totalSold: 0,
                                totalRevenue: 0
                            };
                        }
                        
                        // Update item totals
                        itemAnalysis[item.itemName].totalSold += item.quantity;
                        itemAnalysis[item.itemName].totalRevenue += item.total;
                        totalRevenue += item.total;
                    });
                }
            });
            
            // Convert to array and calculate percentages
            const analysisResults = Object.keys(itemAnalysis).map(itemName => {
                const item = itemAnalysis[itemName];
                return {
                    itemName: itemName,
                    itemCode: item.itemCode,
                    totalSold: item.totalSold,
                    totalRevenue: item.totalRevenue,
                    percentage: totalRevenue > 0 ? (item.totalRevenue / totalRevenue * 100) : 0
                };
            });
            
            // Sort by total revenue (descending)
            analysisResults.sort((a, b) => b.totalRevenue - a.totalRevenue);
            
            // Display results
            if (analysisResults.length === 0) {
                resultsList.innerHTML = '<tr><td colspan="5" style="text-align: center;">No sales data found for the selected period</td></tr>';
            } else {
                resultsList.innerHTML = analysisResults.map(item => `
                    <tr>
                        <td>${item.itemCode}</td>
                        <td>${item.itemName}</td>
                        <td>${item.totalSold}</td>
                        <td>${item.totalRevenue.toFixed(2)}</td>
                        <td>${item.percentage.toFixed(2)}%</td>
                    </tr>
                `).join('');
            }
            
            loadingIndicator.style.display = 'none';
            resultsTable.style.display = 'table';
            
            // Highlight top selling items
            if (analysisResults.length > 0) {
                const topItems = analysisResults.slice(0, 3); // Get top 3 items
                topItems.forEach((item, index) => {
                    const rows = resultsList.querySelectorAll('tr');
                    if (rows[index]) {
                        rows[index].classList.add('top-selling');
                    }
                });
            }
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            alert('Error analyzing sales: ' + error.message);
        });
}

// Add this function to populate the item dropdown
function populateItemDropdown() {
    const itemDropdown = document.getElementById('analysisItemCode');
    
    // Clear existing options except "All Products"
    while (itemDropdown.options.length > 1) {
        itemDropdown.remove(1);
    }
    
    // Get all stock items to populate the dropdown
    database.ref('stock').once('value')
        .then((snapshot) => {
            const items = [];
            
            snapshot.forEach((childSnapshot) => {
                const item = childSnapshot.val();
                items.push({
                    code: item.itemCode || 'N/A',
                    name: item.itemName
                });
            });
            
            // Sort items by name
            items.sort((a, b) => a.name.localeCompare(b.name));
            
            // Add items to dropdown
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.code;
                option.textContent = `${item.name} (${item.code})`;
                itemDropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading stock items:', error);
        });
}

// Call this function when the sales analysis tab is clicked
document.querySelector('#salesManagement .sub-tab[data-subtab="sales-analysis"]').addEventListener('click', function() {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('analysisStartDate').value = today;
    document.getElementById('analysisEndDate').value = today;
    
    // Populate item dropdown
    populateItemDropdown();
});

            // ==============================================
            // STOCK MANAGEMENT FUNCTIONALITY (Updated with Item Code)
            // ==============================================
            const stockItems = document.getElementById('stockItems');
            const addStockItemBtn = document.getElementById('addStockItem');
            const submitStockBtn = document.getElementById('submitStock');
            const deleteAllStockBtn = document.getElementById('deleteAllStock');
            const exportStockSummaryPdf = document.getElementById('exportStockSummaryPdf');
            const stockGrandTotalCell = document.getElementById('stockGrandTotal');

            // Add initial empty row
            addStockItemRow();

            // Add stock item row
            addStockItemBtn.addEventListener('click', addStockItemRow);

            // Submit stock
            submitStockBtn.addEventListener('click', submitStock);

            // Delete all stock
            deleteAllStockBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete ALL stock items? This cannot be undone.')) {
                    database.ref('stock').remove()
                        .then(() => {
                            alert('All stock items have been deleted.');
                            loadStock(); // Refresh the view
                        })
                        .catch(error => {
                            alert('Error deleting stock: ' + error.message);
                        });
                }
            });

            // Export summary to PDF
            exportStockSummaryPdf.addEventListener('click', exportStockSummaryToPDF);

            function addStockItemRow() {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="text" class="item-code" placeholder="Item code"></td>
                    <td><input type="text" class="item-name" placeholder="Item name"></td>
                    <td><input type="number" class="item-qty" min="0" value="0"></td>
                    <td><input type="number" class="item-price" min="0" step="0.01" value="0.00"></td>
                    <td class="item-total">MVR 0.00</td>
                    <td><button type="button" class="btn btn-danger remove-item"><i class="fas fa-times"></i></button></td>
                `;
                stockItems.appendChild(row);

                // Add event listeners
                const codeInput = row.querySelector('.item-code');
                const nameInput = row.querySelector('.item-name');
                const qtyInput = row.querySelector('.item-qty');
                const priceInput = row.querySelector('.item-price');
                const removeBtn = row.querySelector('.remove-item');

                qtyInput.addEventListener('input', () => calculateStockRowTotal(row));
                priceInput.addEventListener('input', () => calculateStockRowTotal(row));
                removeBtn.addEventListener('click', () => {
                    row.remove();
                    updateStockTotals();
                });

                calculateStockRowTotal(row);
            }

            function calculateStockRowTotal(row) {
                const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const total = qty * price;
                row.querySelector('.item-total').textContent = `MVR ${total.toFixed(2)}`;
                updateStockTotals();
            }

            function updateStockTotals() {
                const rows = document.querySelectorAll('#stockItems tr');
                let grandTotal = 0;

                rows.forEach(row => {
                    const totalText = row.querySelector('.item-total').textContent;
                    grandTotal += parseFloat(totalText.replace('MVR', '')) || 0;
                });

                stockGrandTotalCell.textContent = `MVR ${grandTotal.toFixed(2)}`;
            }

            function submitStock() {
                const stockDate = document.getElementById('stockDate').value;
                const notes = document.getElementById('stockNotes').value;

                if (!stockDate) {
                    alert('Please fill in all required fields');
                    return;
                }

                const rows = document.querySelectorAll('#stockItems tr');
                if (rows.length === 0) {
                    alert('Please add at least one item');
                    return;
                }

                // Collect stock items
                const items = [];
                let allItemsValid = true;

                rows.forEach(row => {
                    const code = row.querySelector('.item-code').value;
                    const name = row.querySelector('.item-name').value;
                    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                    const price = parseFloat(row.querySelector('.item-price').value) || 0;

                    if (!code || !name) {
                        allItemsValid = false;
                        return;
                    }

                    if (qty < 0 || price < 0) {
                        allItemsValid = false;
                        return;
                    }

                    items.push({
                        itemCode: code,
                        itemName: name,
                        quantity: qty,
                        price: price,
                        total: qty * price,
                        lastUpdated: stockDate
                    });
                });

                if (!allItemsValid || items.length === 0) {
                    alert('Please add valid items with codes, names, quantities and prices');
                    return;
                }

                // Save to Firebase
                saveStockToFirebase(items, stockDate, notes);
            }

            function saveStockToFirebase(items, date, notes) {
                const updates = {};
                
                // Prepare updates for each stock item
                items.forEach(item => {
                    const stockId = item.itemCode; // Using item code as ID
                    updates[stockId] = {
                        itemCode: item.itemCode,
                        itemName: item.itemName,
                        quantity: item.quantity,
                        price: item.price,
                        lastUpdated: date,
                        notes: notes || ''
                    };
                });

                // Update stock in Firebase
                database.ref('stock').update(updates)
                    .then(() => {
                        // Show success and switch to summary tab
                        alert('Stock updated successfully!');
                        
                        // Switch to summary tab and load stock
                        document.querySelector('#stockManagement .sub-tab[data-subtab="stock-summary"]').click();
                        
                        // Reset form
                        resetStockForm();
                    })
                    .catch(error => {
                        alert('Error saving stock: ' + error.message);
                    });
            }

            function resetStockForm() {
                document.getElementById('stockDate').value = '';
                document.getElementById('stockNotes').value = '';
                stockItems.innerHTML = '';
                addStockItemRow();
            }

            function loadStock() {
                const stockList = document.getElementById('stockList');
                const loadingIndicator = document.getElementById('stockLoadingIndicator');
                const stockTable = document.getElementById('stockSummaryTable');
                const summaryTotals = document.getElementById('stockSummaryTotals');

                // Show loading indicator
                loadingIndicator.style.display = 'block';
                stockTable.style.display = 'none';
                summaryTotals.style.display = 'none';

                // Listen for real-time updates from Firebase
                database.ref('stock').on('value', (snapshot) => {
                    const stockItems = [];
                    let totalQuantity = 0;
                    let totalValue = 0;

                    snapshot.forEach((childSnapshot) => {
                        const stockItem = childSnapshot.val();
                        stockItem.firebaseId = childSnapshot.key; // Store Firebase ID for updates
                        stockItems.push(stockItem);

                        // Calculate totals
                        totalQuantity += stockItem.quantity || 0;
                        totalValue += (stockItem.quantity || 0) * (stockItem.price || 0);
                    });

                    // Update summary totals
                    document.getElementById('totalStockItems').textContent = stockItems.length;
                    document.getElementById('totalStockQuantity').textContent = totalQuantity;
                    document.getElementById('totalStockValue').textContent = totalValue.toFixed(2);

                    if (stockItems.length === 0) {
                        stockList.innerHTML = '<tr><td colspan="7" style="text-align: center;">No stock items found</td></tr>';
                    } else {
                        renderStockTable(stockItems);
                    }

                    // Hide loading indicator and show table and totals
                    loadingIndicator.style.display = 'none';
                    stockTable.style.display = 'table';
                    summaryTotals.style.display = 'grid';
                });
            }

            function renderStockTable(stockItems) {
                const stockList = document.getElementById('stockList');

                // Sort stock by item name
                stockItems.sort((a, b) => a.itemName.localeCompare(b.itemName));

                // Calculate grand totals
                let grandQuantity = 0;
                let grandValue = 0;

                // Render stock table
                stockList.innerHTML = stockItems.map(stockItem => {
                    // Add to grand totals
                    const itemValue = (stockItem.quantity || 0) * (stockItem.price || 0);
                    grandQuantity += stockItem.quantity || 0;
                    grandValue += itemValue;

                    return `
                        <tr data-stock-id="${stockItem.firebaseId}">
                            <td>${stockItem.itemCode || 'N/A'}</td>
                            <td>${stockItem.itemName}</td>
                            <td>${stockItem.quantity}</td>
                            <td>${stockItem.price.toFixed(2)}</td>
                            <td>${itemValue.toFixed(2)}</td>
                            <td>${new Date(stockItem.lastUpdated).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-danger delete-stock" data-stock="${stockItem.firebaseId}"><i class="fas fa-trash-alt"></i> Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('');

                // Update grand totals row
                document.getElementById('stockSummaryTotalQty').textContent = grandQuantity;
                document.getElementById('stockSummaryGrandTotal').textContent = `MVR ${grandValue.toFixed(2)}`;

                // Add event listeners to delete buttons
                document.querySelectorAll('.delete-stock').forEach(button => {
                    button.addEventListener('click', function() {
                        const stockId = this.dataset.stock;
                        if (confirm(`Are you sure you want to delete this stock item?`)) {
                            deleteStockItem(stockId);
                        }
                    });
                });
            }

            function deleteStockItem(stockId) {
                database.ref('stock/' + stockId).remove()
                    .then(() => {
                        // The real-time listener will automatically update the table
                    })
                    .catch(error => {
                        alert('Error deleting stock item: ' + error.message);
                    });
            }

            function exportStockSummaryToPDF() {
                // Create a new jsPDF instance
                const doc = new jsPDF();

                // Add title
                doc.setFontSize(18);
                doc.setTextColor(40, 40, 40);
                doc.text('Stock Summary Report', 105, 15, { align: 'center' });

                // Add summary information
                doc.setFontSize(12);
                doc.setTextColor(80, 80, 80);

                const totalItems = document.getElementById('totalStockItems').textContent;
                const totalQuantity = document.getElementById('totalStockQuantity').textContent;
                const totalValue = document.getElementById('totalStockValue').textContent;

                doc.text(`Total Items: ${totalItems}`, 14, 25);
                doc.text(`Total Quantity: ${totalQuantity}`, 14, 32);
                doc.text(`Total Value (MVR): ${totalValue}`, 14, 39);
                doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 46);

                // Get all stock items from the table
                const stockItems = [];
                const rows = document.querySelectorAll('#stockList tr');

                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 6) {
                        stockItems.push({
                            itemCode: cells[0].textContent,
                            itemName: cells[1].textContent,
                            quantity: cells[2].textContent,
                            price: cells[3].textContent,
                            value: cells[4].textContent,
                            lastUpdated: cells[5].textContent
                        });
                    }
                });

                // Add stock items table
                const stockData = stockItems.map(item => [
                    item.itemCode,
                    item.itemName,
                    item.quantity,
                    item.price,
                    item.value,
                    item.lastUpdated
                ]);

                // Add grand totals row
                const grandQuantity = document.getElementById('stockSummaryTotalQty').textContent;
                const grandValue = document.getElementById('stockSummaryGrandTotal').textContent;

                stockData.push([
                    { content: 'Grand Totals', colSpan: 2, styles: { fontStyle: 'bold' } },
                    grandQuantity,
                    '',
                    { content: grandValue, styles: { fontStyle: 'bold' } },
                    ''
                ]);

                doc.autoTable({
                    startY: 55,
                    head: [['Item Code', 'Item Name', 'Quantity', 'Price (MVR)', 'Value (MVR)', 'Last Updated']],
                    body: stockData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [52, 152, 219],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 'auto' },
                        2: { cellWidth: 'auto' },
                        3: { cellWidth: 'auto' },
                        4: { cellWidth: 'auto' },
                        5: { cellWidth: 'auto' }
                    },
                    styles: {
                        fontSize: 10,
                        cellPadding: 3,
                        overflow: 'linebreak'
                    },
                    margin: { left: 14 }
                });

                // Add footer
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });

                // Save the PDF
                doc.save(`Stock_Summary_${new Date().toISOString().slice(0,10)}.pdf`);
            }

            // ==============================================
            // INITIALIZATION
            // ==============================================

            // Set today's date as default for all date fields
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('orderDate').value = today;
            document.getElementById('expenseDate').value = today;
            document.getElementById('saleDate').value = today;
            document.getElementById('stockDate').value = today;
            document.getElementById('analysisStartDate').value = today;
            document.getElementById('analysisEndDate').value = today;

            // Initialize the first tab as active
            document.querySelector('.main-tab.active').click();
        });
 