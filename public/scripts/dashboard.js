const mindMapsList = document.getElementById("mindMapList");
const mindMapsMsg = document.getElementById("mindMapMessage");

async function loadMindMaps(){
    mindMapsMsg.textContent = "Loading...";

    try {
        const response = await fetch("/api/mindmaps");

        if(response.status === 401){
            window.location.href = "/login.html";
            return;
        }

        if(!response.ok){
            throw new Error(`Server responded with ${response.status}`);
        }

        const maps = await response.json();

        if(maps.length === 0){
            mindMapsMsg.textContent = "You don't have any mind maps yet.";
            return;
        }

        mindMapsMsg.textContent = "";

        maps.forEach(map => {
            const item = document.createElement("li");

            const link = document.createElement("a");
            link.classList.add("item-card");
            link.href = `/mindMap/MM.html?id=${map.id}`;

            const title = document.createElement("span");
            title.classList.add("item-title");
            title.textContent = map.title;

            const date = document.createElement("span");
            date.classList.add("item-date");
            date.textContent = new Date(map.updated_at).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short"
            });

            link.append(title, date);
            item.appendChild(link);
            mindMapsList.appendChild(item);
        });
    } catch (error) {
        console.error(error);
        mindMapsMsg.textContent = "Could not load your mind maps.";
    }
}

loadMindMaps();