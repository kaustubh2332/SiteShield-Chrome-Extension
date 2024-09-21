var webUrl;
var webHostName;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  webUrl = tabs[0].url;
  webHostName = new URL(tabs[0].url).hostname;
  console.log(webUrl, webHostName);
  document.getElementById("url").innerText = webHostName;
});

function showError(text) {
  var div = document.createElement('div');
  div.setAttribute('id', 'ERRORcontainer');
  div.innerHTML = `
      <div class="ERROR">
        <p>${text}</p>
      </div> 
  `;
  document.getElementsByClassName("bottomItem")[0].appendChild(div);
  setTimeout(() => {
    document.getElementById("ERRORcontainer").remove();
  }, 3000);
}

document.getElementById("btn").addEventListener("click", () => {
  console.log("clicked");
  if (webUrl.toLowerCase().includes("chrome://")) {
      showError("You cannot block this site");
      console.log("yes");
    } else {
      var value = prompt("For how many hours you want to block this site ?");
    chrome.storage.local.get("BlockedUrls", (data) => {
      if (!Array.isArray(data.BlockedUrls)) {
        data.BlockedUrls = [];
      }

      const existingBlock = data.BlockedUrls.find((e) => e.url === webHostName);

      if (existingBlock) 
        {
        if (existingBlock.status === "inProgress") 
            {
                showError("This URL will be completely blocked soon");
             } 
        else if (existingBlock.status === "BLOCKED")
             {
                showError("This URL is already blocked");
             }
      } 
      else 
      {
        
        chrome.storage.local.set({BlockedUrls: [...data.BlockedUrls,{ status: "inProgress", url: webHostName }]});
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => 
            {
          chrome.tabs.sendMessage(tabs[0].id, {from: "Popup",subject: "start_timer"});
            });

        setTimeout(() => {
          const blockTill = Date.now() + parseInt(value) * 60 * 60 * 1000; 

          chrome.storage.local.get("BlockedUrls", (data) => {
            const updatedUrls = data.BlockedUrls.map((entry) =>
              entry.url === webHostName ? { ...entry, status: "BLOCKED", BlockTill: blockTill }: entry
            );
            chrome.storage.local.set({ BlockedUrls: updatedUrls });
          });
        }, 5000);
      }
    });
  }
});
