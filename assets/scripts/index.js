let chart;
function updateGraph(data) {
    let label = 'Crime frequency';

    data = data || [
      { category: "Crime 1", count: Math.floor(Math.random() * 36) + 5 },
      { category: "Crime 2", count: Math.floor(Math.random() * 26) + 5 },
      { category: "Crime 3", count: Math.floor(Math.random() * 26) + 5 },
      { category: "Crime 4", count: Math.floor(Math.random() * 26) + 5 },
      { category: "Crime 5", count: Math.floor(Math.random() * 26) + 5 },
      { category: "Crime 6", count: Math.floor(Math.random() * 26) + 5 },
      { category: "Crime 7", count: Math.floor(Math.random() * 26) + 5 },
    ];
  
    if (chart) { chart.destroy() }
    chart = new Chart(
        document.getElementById('crime-graph'),
        {
            type: 'radar',
            data: {
                labels: data.map(row => row.category),
                datasets: [
                    {
                        label: label,
                        data: data.map(row => row.count)
                    }
                ]
            }
        });
  }

  function search(e) {
    e.preventDefault();
    alert(document.querySelector("#city-input").value)
  }

  updateGraph();

  document.querySelector("#nav").addEventListener("click", ()=>updateGraph());
  document.querySelector("#submit").addEventListener("click", search);

//   function to get api data for wiki api

function wikiapi(){

    $.ajax({
        url: "https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=5&gsrsearch='New_England_Patriots'",
        method:"GET"
    }).then(function(response){
        console.log(response);
    });
};

wikiapi();