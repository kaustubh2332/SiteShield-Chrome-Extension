function closetab() {
    chrome.runtime.sendMessage({ closeme: true });
    alert("This URL is completely blocked for today. This tab will close after you press OK.");
  }
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.from === "Popup" && message.subject === "start_timer") {
      var hour = 0;
      var min = 0;
      var sec = 5;
      var div = document.createElement("div");
      div.innerHTML = `
        <div class="SStopItem">
          <h1>Site is Shielded</h1>
          <div class="SStopItemMain">
            <div class="SSInfo">
              <p>You are currently on :</p>
              <h4 id="SSurl">${window.location.hostname}</h4>
            </div>
          </div>
        </div>
    
        <div class="SSbottomItem">
          <div class="SStimeCont">
            <p>Time Remaining</p>
            <div class="SStime">
              <div class="SSnumber">
                <p id="SShour">${("0" + hour).slice(-2)}</p>
              </div>
              <span>:</span>
              <div class="SSnumber">
                <p id="SSmin">${("0" + min).slice(-2)}</p>
              </div>
              <span>:</span>
              <div class="SSnumber">
                <p id="SSsec">${("0" + sec).slice(-2)}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.prepend(div);
      
      var interval = setInterval(() => {
        if (sec >= 1) {
          sec = sec - 1;
          document.getElementById("SSsec").innerText = ("0" + sec).slice(-2);
        } else {
          clearInterval(interval);
          closetab();
        }
      }, 1000);
    }
  });
  
  // Check if the site is blocked
  chrome.storage.local.get("BlockedUrls", (data) => {
    if (data.BlockedUrls !== undefined) {
      const blockedEntry = data.BlockedUrls.find(
        (e) => e.url === window.location.hostname && e.status === "BLOCKED"
      );
      var currentTime = Date.now();
      if (blockedEntry) {
        if (currentTime > blockedEntry.BlockTill) {
          // Unblock the site after the block period is over
          const updatedBlockedUrls = data.BlockedUrls.filter(
            (e) => e.url !== window.location.hostname
          );
          chrome.storage.local.set({ BlockedUrls: updatedBlockedUrls });
        } else {
          // Block the site
          closetab();
        }
      }
    }
  });
  