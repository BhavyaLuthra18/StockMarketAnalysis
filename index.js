import fetchAndCreateChart from "./chart.js";
// Default stock symbol
let symbol = "AAPL";
// Fetching and Creating chart for the default stock symbol ('AAPL') over 5 years
fetchAndCreateChart('5y', symbol);

export async function getStocks(symbol){
const url = `https://stocks3.onrender.com/api/stocks/getstocksprofiledata`;  //URL for fetching stock profile data.
try {
  const response = await fetch(url);
  const result = await response.json();

   // Displaying the summary of the stock in the UI
  const stocksummary = document.querySelector('#summary');
  stocksummary.querySelector('p').textContent = result.stocksProfileData[0][symbol].summary;
} catch (error) {
  console.error(error);
}
}
// Function to fetch stock statistics based on the symbol
export async function getStats(symbol){
const url = `https://stocks3.onrender.com/api/stocks/getstockstatsdata`; //URL for fetching stock statistics data

try {
  const response = await fetch(url);
  const result = await response.json();
  
// Extracting book value and profit for the specified stock symbol from the response.
  const bookValue = result.stocksStatsData[0][symbol].bookValue;
  const profit = result.stocksStatsData[0][symbol].profit;
  const stocksummary = document.querySelector('#summary');
  stocksummary.querySelector('#name').textContent = symbol;
  const Profit = document.getElementById("profit")
  Profit.textContent = `${profit}%`;
  // Setting the color of the profit display based on whether it's positive or negative.
  if (profit > 0) {
    Profit.setAttribute('style', 'color: green');
  } else {
    Profit.setAttribute('style', 'color: red');
  }
  document.getElementById("bookValue").textContent = `$${bookValue}`;

} catch (error) {
  console.error(error);
}
}
 // Function to get status for a stock in the list
async function getStatusinList(symbol){
const url = `https://stocksapi-uhe1.onrender.com/api/stocks/getstockstatsdata`; //fetching stock statistics data for the specified symbol.
let bookValue;
let profit;
try {
  const response = await fetch(url);
  const result = await response.json();
 // Retrieving book value and profit for the stock
  bookValue = result.stocksStatsData[0][symbol].bookValue;
  profit = result.stocksStatsData[0][symbol].profit;
} catch (error) {
  console.error(error);
}
  return {bookValue,profit};
}


//Function to render the stock List 
async function renderList(){
const list = ['AAPL' ,'MSFT' ,'GOOGL' ,'AMZN' ,'PYPL' ,'TSLA' ,'JPM' ,'NVDA', 'NFLX', 'DIS'];
const listEl = document.getElementById('stock-list');

  // Loop through each stock symbol in the list
for (const stock of list) {
const { bookValue, profit } = await getStatusinList(stock);
const list_item = document.createElement("div");
const name = document.createElement('button');
name.classList.add('list');
const bookV = document.createElement('span');
const proft = document.createElement('span');
  // Setting style based on profit value
if (profit > 0) {
      proft.setAttribute('style', 'color: #90EE90' );
    } else {
      proft.setAttribute('style', 'color: red');
    }
// Adding classes and content to the elements
list_item.classList.add('list_i');
name.textContent = stock;
name.value = stock;
bookV.textContent = `$${bookValue}`;
proft.textContent = `${profit.toFixed(2)}%`;
   // Append elements to the list item
list_item.append(name, bookV, proft);
   // Append the list item to the stock list element
listEl.append(list_item);
 // Add a click event listener to the stock name button
name.addEventListener('click',(e)=>{
    // Fetch and create a chart for the selected stock symbol over 5 years
fetchAndCreateChart('5y',stock)
})
}
}
renderList(); 