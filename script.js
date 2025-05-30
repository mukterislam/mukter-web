import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSfiRc8RvFDq9LxPqxQR-hTuZUoj5JskM",
  authDomain: "mukhh-ebd9c.firebaseapp.com",
  databaseURL: "https://mukhh-ebd9c-default-rtdb.firebaseio.com",
  projectId: "mukhh-ebd9c",
  storageBucket: "mukhh-ebd9c.appspot.com",
  messagingSenderId: "389900628270",
  appId: "1:389900628270:web:5be670206e8877307d4abf",
  measurementId: "G-F185T8Z6B4"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const addCustomerForm = document.getElementById('add-customer-form');
const updateTransactionForm = document.getElementById('update-transaction-form');
const customerSelect = document.getElementById('customer-select');
const incrementButton = document.getElementById('increment-amount');
const decrementButton = document.getElementById('decrement-amount');
const amountInput = document.getElementById('update-amount');
const ledgerList = document.getElementById('ledger-list');
const totalAmountDisplay = document.getElementById('total-amount');
const viewCustomerBtn = document.getElementById('view-customer-btn');
const viewCustomerModal = document.getElementById('view-customer-modal');
const viewCustomerName = document.getElementById('view-customer-name');
const viewCustomerAmount = document.getElementById('view-customer-amount');
const closeViewCustomer = document.getElementById('close-view-customer');

const customers = {};

// Update total amount in Firebase
const updateTotalAmountInFirebase = () => {
  const totalAmount = Object.values(customers).reduce((sum, amount) => sum + amount, 0);
  set(ref(database, 'totalAmount'), totalAmount);
};

// Sync total amount from Firebase
const syncTotalAmountFromFirebase = () => {
  const totalRef = ref(database, 'totalAmount');
  onValue(totalRef, (snapshot) => {
    const total = snapshot.val();
    totalAmountDisplay.textContent = `মোট বাকি: ${total || 0} BDT`;
  });
};

// Add a customer to Firebase
const addCustomerToFirebase = (customerName) => {
  set(ref(database, 'customers/' + customerName), { amount: 0 });
};

// Sync customers from Firebase
const syncCustomersFromFirebase = () => {
  const customersRef = ref(database, 'customers');
  onValue(customersRef, (snapshot) => {
    const data = snapshot.val();
    ledgerList.innerHTML = '';
    customerSelect.innerHTML = `<option value="" disabled selected>Select Customer</option>`;
    if (data) {
      Object.keys(data).forEach((customerName) => {
        customers[customerName] = data[customerName].amount;

        const option = document.createElement('option');
        option.value = customerName;
        option.textContent = customerName;
        customerSelect.appendChild(option);

        const listItem = document.createElement('li');
        listItem.className = 'ledger-item';
        listItem.id = customerName;
        listItem.innerHTML = `
          <span class="customer-name">${customerName}</span>
          <span class="customer-amount">${customers[customerName]} BDT</span>
        `;
        ledgerList.appendChild(listItem);
      });
    }
  });
};

// Add customer
addCustomerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newCustomer = document.getElementById('new-customer').value.trim();

  if (newCustomer && !customers[newCustomer]) {
    customers[newCustomer] = 0;
    addCustomerToFirebase(newCustomer);
    addCustomerForm.reset();
  } else {
    alert('Customer already exists or name is invalid!');
  }
});

// Update customer amount in Firebase
const updateCustomerAmountInFirebase = (customerName) => {
  update(ref(database, 'customers/' + customerName), { amount: customers[customerName] });
};

// Handle "+" button
incrementButton.addEventListener('click', () => {
  const selectedCustomer = customerSelect.value;
  const updateAmount = parseFloat(amountInput.value);

  if (selectedCustomer && !isNaN(updateAmount)) {
    customers[selectedCustomer] += updateAmount;
    updateCustomerAmountInFirebase(selectedCustomer);
    amountInput.value = 0;
    updateTotalAmountInFirebase();
  } else {
    alert('Please select a valid customer and enter an amount.');
  }
});

// Handle "-" button
decrementButton.addEventListener('click', () => {
  const selectedCustomer = customerSelect.value;
  const updateAmount = parseFloat(amountInput.value);

  if (selectedCustomer && !isNaN(updateAmount)) {
    customers[selectedCustomer] = Math.max(0, customers[selectedCustomer] - updateAmount);
    updateCustomerAmountInFirebase(selectedCustomer);
    amountInput.value = 0;
    updateTotalAmountInFirebase();
  } else {
    alert('Please select a valid customer and enter an amount.');
  }
});

// Open View Customer Modal
viewCustomerBtn.addEventListener('click', () => {
  const selectedCustomer = customerSelect.value;

  if (selectedCustomer) {
    viewCustomerName.textContent = `Name: ${selectedCustomer}`;
    viewCustomerAmount.textContent = `Amount: ${customers[selectedCustomer]} BDT`;
    viewCustomerModal.style.display = 'block';
  } else {
    alert('Please select a customer to view details.');
  }
});

// Close View Customer Modal
closeViewCustomer.addEventListener('click', () => {
  viewCustomerModal.style.display = 'none';
});

// Sync data from Firebase
syncCustomersFromFirebase();
syncTotalAmountFromFirebase();