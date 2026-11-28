const mindMapsList = document.getElementById("mindMapList");
const mindMapsMsg = document.getElementById("mindMapMessage");

const wordSearchList = document.getElementById("wordSearchList");
const wordSearchMsg = document.getElementById("wordSearchMessage");

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

async function loadWordSearches(){
    wordSearchMsg.textContent = "Loading...";

    try {
        const response = await fetch("/api/wordsearch");

        if(response.status === 401){
            window.location.href = "/login.html";
            return;
        }

        if(!response.ok){
            throw new Error(`Server responded with ${response.status}`);
        }

        const searches = await response.json();

        if(searches.length === 0){
            wordSearchMsg.textContent = "You don't have any Word Searches yet.";
            return;
        }

        wordSearchMsg.textContent = "";

        searches.forEach(search => {
            const item = document.createElement("li");

            const link = document.createElement("a");
            link.classList.add("item-card");

            link.href = `/wordSearch/wordSearch.html?id=${search.id}`;

            const title = document.createElement("span");
            title.classList.add("item-title");
            title.textContent = search.title;

            const date = document.createElement("span");
            date.classList.add("item-date");
            date.textContent = new Date(search.created_at).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short"
            });

            link.append(title, date);
            item.appendChild(link);
            wordSearchList.appendChild(item);
        });
    } catch (error) {
        console.error(error);
        wordSearchMsg.textContent = "Could not load your Word Searches.";
    }
}

loadMindMaps();
loadWordSearches();