import {
  product1, product2, product3, product4, product5,
  product6, product7, product8, product9, product10,
  avatar1, avatar2, avatar4,
} from '@/assets/images'

// --- Notifications ---
export const notifications = []

// --- Current user ---
export const currentUser = {
  name: 'Shrina Tesla',
  username: '@imshrina',
  avatar: avatar1,
}

// --- Dashboard stat cards ---
export const dashboardStats = [
  {
    id: 1,
    label: 'Total Sales',
    value: '$25,000',
    change: '+5% since last month',
    color: 'primary',
    icon: 'ti-report-analytics',
  },
  {
    id: 2,
    label: 'Total Purchase',
    value: '$18,000',
    change: '+22% since last month',
    color: 'success',
    icon: 'ti-repeat',
  },
  {
    id: 3,
    label: 'Total Expenses',
    value: '$9,000',
    change: '+10% since last month',
    color: 'info',
    icon: 'ti-currency-dollar',
  },
  {
    id: 4,
    label: 'Invoice Due',
    value: '$25,000',
    change: '+35% since last month',
    color: 'warning',
    icon: 'ti-notes',
  },
]

// --- Dashboard metric cards ---
export const dashboardMetrics = [
  {
    id: 1,
    label: 'Total Profit',
    value: '$25,458',
    change: '+35%',
    changeType: 'success',
    icon: 'ti-layers-subtract',
    iconColor: 'text-primary',
  },
  {
    id: 2,
    label: 'Total Payment Returns',
    value: '$45,458',
    change: '-20%',
    changeType: 'danger',
    icon: 'ti-credit-card',
    iconColor: 'text-danger',
  },
  {
    id: 3,
    label: 'Total Expenses',
    value: '$34,458',
    change: '-20%',
    changeType: 'warning',
    icon: 'ti-cash-banknote',
    iconColor: 'text-warning',
  },
]

// --- Top selling products ---
export const topSellingProducts = [
  { id: 1, name: 'Wireless Earphones', price: '$89', units: '1,250 Units', badge: '18%', badgeColor: 'danger', img: product2 },
  { id: 2, name: 'Gaming Joy Stick', price: '$49', units: '5,420 Units', badge: '32%', badgeColor: 'primary', img: product1 },
  { id: 3, name: 'Smart Watch Pro', price: '$98', units: '862 Units', badge: '22%', badgeColor: 'info', img: product3 },
  { id: 4, name: 'USB-C Fast Charger', price: '$35', units: '3,200 Units', badge: '28%', badgeColor: 'success', img: product4 },
  { id: 5, name: 'Portable Bluetooth Speaker', price: '$65', units: '2,890 Units', badge: '25%', badgeColor: 'warning', img: product5 },
]

// --- Low stock products ---
export const lowStockProducts = [
  { id: 1, name: 'Wireless Headphones', sku: '#554433', stock: '06', img: product8 },
  { id: 2, name: 'USB-C Cable Pack', sku: '#887766', stock: '09', img: product4 },
  { id: 3, name: 'Phone Screen Protector', sku: '#332211', stock: '03', img: product10 },
  { id: 4, name: 'Portable Charger 20000mAh', sku: '#998877', stock: '07', img: product4 },
  { id: 5, name: 'Mechanical Keyboard RGB', sku: '#665544', stock: '02', img: product6 },
]

// --- Recent sales ---
export const recentSales = [
  { id: 1, name: 'MacBook Pro 16"', category: 'Computers', price: '$2,499', status: 'Completed', statusColor: 'success', img: product7 },
  { id: 2, name: 'AirPods Pro Max', category: 'Audio', price: '$549', status: 'Processing', statusColor: 'primary', img: product9 },
  { id: 3, name: 'iPad Air 11"', category: 'Tablets', price: '$799', status: 'Completed', statusColor: 'success', img: product8 },
  { id: 4, name: 'Apple Watch Ultra', category: 'Wearables', price: '$799', status: 'Pending', statusColor: 'warning', img: product3 },
  { id: 5, name: 'Magic Keyboard', category: 'Accessories', price: '$299', status: 'Cancelled', statusColor: 'danger', img: product6 },
]

// --- Inventory products ---
export const inventoryProducts = [
  { id: 1, name: 'Gaming Joy Stick', code: 'PRD001', category: 'Electronics', brand: 'Brand Name', price: '$99.99', unit: 'pcs', qty: 150, img: product1 },
  { id: 2, name: 'Wireless Earphones', code: 'PRD002', category: 'Electronics', brand: 'Tech Pro', price: '$89.99', unit: 'pcs', qty: 320, img: product2 },
  { id: 3, name: 'Smart Watch Pro', code: 'PRD003', category: 'Electronics', brand: 'Tech Pro', price: '$98.00', unit: 'pcs', qty: 200, img: product3 },
  { id: 4, name: 'USB-C Fast Charger', code: 'PRD004', category: 'Electronics', brand: 'Tech Pro', price: '$86.00', unit: 'pcs', qty: 80, img: product4 },
  { id: 5, name: 'Portable Bluetooth Speaker', code: 'PRD005', category: 'Electronics', brand: 'Tech Pro', price: '$32.00', unit: 'pcs', qty: 110, img: product5 },
  { id: 6, name: 'Magic Keyboard', code: 'PRD006', category: 'Electronics', brand: 'Tech Pro', price: '$49.00', unit: 'pcs', qty: 10, img: product6 },
  { id: 7, name: 'MacBook Pro 16"', code: 'PRD007', category: 'Electronics', brand: 'Tech Pro', price: '$99.00', unit: 'pcs', qty: 10, img: product7 },
  { id: 8, name: 'Wireless Headphones', code: 'PRD008', category: 'Electronics', brand: 'Tech Pro', price: '$109.00', unit: 'pcs', qty: 200, img: product8 },
]

// --- Reports stat cards ---
export const reportStats = [
  { id: 1, label: 'Total Revenue', value: '$45,231', change: '12% from last month', changeType: 'success' },
  { id: 2, label: 'Products Sold', value: '1,234', change: '8% from last month', changeType: 'success' },
  { id: 3, label: 'Low Stock Items', value: '23', change: '3% from last month', changeType: 'danger' },
  { id: 4, label: 'Out of Stock', value: '5', change: '2% from last month', changeType: 'danger' },
]

// --- Reports top products ---
export const topReportProducts = [
  { id: 1, name: 'Gaming Joy Stick', units: '156 units sold', revenue: '$3,120', img: product1 },
  { id: 2, name: 'Wireless Headphones', units: '134 units sold', revenue: '$2,680', img: product2 },
  { id: 3, name: 'Smartwatch', units: '98 units sold', revenue: '$1,960', img: product3 },
]

// --- Chart data ---
export const salesPurchaseChartOptions = {
  series: [
    { name: 'Sales', data: [44, 55, 57, 56, 61, 58, 63, 60, 66] },
    { name: 'Purchase', data: [76, 85, 101, 98, 87, 105, 91, 114, 94] },
  ],
  options: {
    colors: ['#f7a085', '#E66239'],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
    },
    grid: { borderColor: '#e2e8f0' },
    legend: {
      fontFamily: 'Poppins, serif',
      fontWeight: 500,
      markers: { size: 5, shape: 'square' },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '85%',
        borderRadius: 3,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: ['28 Jan', '29 Jan', '30 Jan', '31 Jan', '1 Feb', '2 Feb', '3 Feb', '4 Feb', '5 Feb'],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { formatter: v => v + 'k' },
      title: { text: '$ (thousands)' },
    },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: val => '$ ' + val + ' thousands' } },
  },
}

export const customerChartOptions = {
  series: [44, 55],
  options: {
    chart: { height: 200, type: 'radialBar' },
    colors: ['#5BE49B', '#E66239'],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { fontSize: '22px' },
          value: { fontSize: '16px' },
          total: { show: false },
        },
        hollow: { margin: 3, size: '40%', background: 'transparent' },
        track: {
          background: '#f0f0f0',
          strokeWidth: '45%',
          margin: 5,
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        gradientToColors: ['#007867', '#FFD666', '#FFAC82'],
        stops: [0, 100],
      },
    },
    stroke: { lineCap: 'round' },
    labels: ['First Time', 'Return'],
  },
}

export const salesOverviewData = {
  thisYear: [42000, 53000, 48000, 61000, 72000, 69000, 74000, 82000, 78000, 86000, 91000, 97000],
  lastYear: [38000, 45000, 47000, 56000, 65000, 63000, 68000, 70000, 69000, 75000, 80000, 84000],
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
