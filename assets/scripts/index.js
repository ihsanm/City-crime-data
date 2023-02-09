function updateGraph(data) {
    data = data || [
      { category: "Crime 1", count: 10 },
      { category: "Crime 2", count: 20 },
      { category: "Crime 3", count: 15 },
      { category: "Crime 4", count: 25 },
      { category: "Crime 5", count: 22 },
      { category: "Crime 6", count: 30 },
      { category: "Crime 7", count: 28 },
    ];

    const config = {
        type: 'radar',
        data: data,
        options: {
          elements: {
            line: {
              borderWidth: 3
            }
          }
        },
      };
  
    new Chart(
      document.getElementById('crime-graph'),
      {
        type: 'radar',
        data: {
          labels: data.map(row => row.category),
          datasets: [
            {
              label: 'Crime frequency',
              data: data.map(row => row.count)
            }
          ]
        }
      }
    );
  }

  updateGraph();