(function () {
  "use strict";
  function addLink() {
    const linkUrl = "https://ar.afcec-cloud.af.mil/Default.aspx";
    const slide = document.querySelector("#slide10");
    if (!slide) {
      console.error(
        "Could not add https://ar.afcec-cloud.af.mil/Default.aspx link: missing slide #10."
      );
      setTimeout(addLink, 1000);
    } else {
      let link = slide.querySelector("#link");
      if (!link) {
        link = document.createElement("div");
        const section = slide.querySelector("section");
        link.id = "link";
        link.innerHTML = `Proposed plan:<br><a href="${linkUrl}" target="_blank">${linkUrl}</a> (AR#13154)<br><br><br>`;
        while (section.lastElementChild.tagName.toUpperCase() === "BR") {
          section.removeChild(section.lastElementChild);
        }
        setTimeout(function () {
          section.appendChild(link);
        }, 100);
      }
    }
  }
  addLink();
})();
