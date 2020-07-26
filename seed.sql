INSERT INTO savedTracker (name, city) VALUES('Ashley', 'seattle') RETURNING *;

INSERT INTO cities (search_query, formatted_query, lat, lon) VALUES('spokane', 'Spokane, Spokane County, Washington, USA', '47.6571934', '-117.4235106') RETURNING *;