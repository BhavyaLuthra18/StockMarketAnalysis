import { getStocks, getStats } from './index.js';

let symbol;

export default async function fetchAndCreateChart(range = '5y', stockSymbol = 'AMRN') {
  // API endpoint URL to fetch stock data
  const url = `https://stocks3.onrender.com/api/stocks/getstocksdata`;

  symbol = stockSymbol;  // Store the stock symbol

  try {
    // Fetching data from the API
    const response = await fetch(url);
    const result = await response.json();

    // Extracting chart data and labels
    const chartData = result.stocksData[0][symbol][range].value;
    const labels = result.stocksData[0][symbol][range].timeStamp.map(timestamp => new Date(timestamp * 1000).toLocaleDateString());

    // Draw the chart using the extracted data
    drawChart(chartData, labels, symbol);
    // Updating stocks and stats
    getStocks(symbol);
    getStats(symbol);
  } catch (error) {
    console.error(error);  // Log any errors
  }
}

// Array of button IDs
const buttons = ['btn1d', 'btn1mo', 'btn1y', 'btn5y'];

// Add event listeners to the buttons
buttons.forEach(btn => {
  const button = document.getElementById(btn);
  button.addEventListener('click', () => {
    // Defining time ranges for each button
    const timeRanges = { 'btn1d': '1mo', 'btn1mo': '3mo', 'btn1y': '1y', 'btn5y': '5y' };
    // Fetching and creating  chart with the corresponding time range based on the button clicked
    fetchAndCreateChart(timeRanges[btn], symbol);
  });
});

//----------------Draw chart function-----------//
function drawChart(data, labels, stockName) {
   // Retrieving the canvas and its 2D rendering context
  const canvas = document.getElementById('chartCanvas');
  const context = canvas.getContext('2d');
  // Calculating dimensions and scaling factors
  const chartHeight = canvas.height - 40;
  const chartWidth = canvas.width - 60;
  const dataMax = Math.max(...data);
  const dataMin = Math.min(...data);
  const dataRange = dataMax - dataMin;
  const dataStep = dataRange > 0 ? chartHeight / dataRange : 0;
  const stepX = chartWidth / (data.length - 1);

  // Clearing the canvas at the beginning
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Drawing the chart lines
  context.beginPath();
  context.moveTo(0, chartHeight - (data[0] - dataMin) * dataStep);
  for (let i = 1; i < data.length; i++) {
    context.lineTo(i * stepX, chartHeight - (data[i] - dataMin) * dataStep);
  }
  context.strokeStyle = '#39FF14'; //line color
  context.lineWidth = 2;//line width
  context.stroke();//Drawing the lines

  // Draw a dotted horizontal line for value 0
  context.beginPath();
  context.setLineDash([2, 2]);
  const zeroY = chartHeight - (0 - dataMin) * dataStep;
  context.moveTo(0, zeroY);
  context.lineTo(canvas.width, zeroY);
  context.strokeStyle = '#ccc';
  context.stroke();
  context.setLineDash([]);

  // Show tooltip and x-axis value on hover
  const tooltip = document.getElementById('tooltip');
  const xAxisLabel = document.getElementById('xAxisLabel');

  // Find peak and low values
  const peakValue = dataMax.toFixed(2);
  const lowValue = dataMin.toFixed(2);

  // Displaying peak and low values
  context.font = '1.4rem Arial';
  context.fillStyle = '#39FF14';
  context.fillText(`Peak: $${peakValue}`, 10, 20);
  context.fillText(`Low: $${lowValue}`, 10, 40);

  // Event listener for mouse movement to show tooltip and x-axis label
  canvas.addEventListener('mousemove', (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    const dataIndex = Math.min(Math.floor(x / stepX), data.length - 1);
    const stockValue = data[dataIndex].toFixed(2);
    const xAxisValue = labels[dataIndex];

 // Displaying the tooltip near the mouse pointer.
    tooltip.style.display = 'block';
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y - 20}px`;
    tooltip.textContent = `${stockName}: $${stockValue}`;

    
  // Displaying the x-axis label at the current mouse position.
    xAxisLabel.style.display = 'block';
    xAxisLabel.style.fontSize = '14px';
    xAxisLabel.style.fontWeight = 'bolder';
    xAxisLabel.style.left = `${x}px`;
    xAxisLabel.textContent = xAxisValue;

    // Clearing the canvas except for the vertical line and data point
    context.clearRect(0, 0, canvas.width, chartHeight);//Clearing the chart area
    context.clearRect(0, chartHeight + 20, canvas.width, canvas.height - chartHeight - 20);//clearing the area below the chart

    // Draw the chart (to show the chart along with the vertical line and data point at the current position).
    context.beginPath();
    context.moveTo(0, chartHeight - (data[0] - dataMin) * dataStep);
    for (let i = 1; i < data.length; i++) {
      context.lineTo(i * stepX, chartHeight - (data[i] - dataMin) * dataStep);//Drawing line for each data point
    }
    context.strokeStyle = '#39FF14';
    context.lineWidth = 2;
    context.stroke();

    // Draw the dotted horizontal line for value 0
    context.beginPath();
    context.setLineDash([2, 2]);
    context.moveTo(0, zeroY);
    context.lineTo(canvas.width, zeroY);
    context.strokeStyle = '#ccc';
    context.stroke();
    context.setLineDash([]);

    // Draw a vertical line at the current x position when hovering over the chart
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, chartHeight);
    context.strokeStyle = '#ccc';
    context.stroke();

    // Draw the data point as a bolder ball
    context.beginPath();
    // The x-coordinate is the current mouse position, and the y-coordinate is determined based on the data value
    context.arc(x, chartHeight - (data[dataIndex] - dataMin) * dataStep, 6, 0, 2 * Math.PI);
    context.fillStyle = '#39FF14';// Fill the circle with a green color
    context.fill();
  });

  // Event listener for mouseout to hide tooltip and x-axis label
  canvas.addEventListener('mouseout', () => {
     // Hide the tooltip when mouse leaves the chart area
    tooltip.style.display = 'none';
      // Hide the x-axis label when mouse leaves the chart area
    xAxisLabel.style.display = 'none';
      // Clear the canvas and redraw the chart when mouse leaves the chart area
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawChart(data, labels, stockName);
  });
}
