(async (win, doc, tools) => {
    const oWrapper = doc.getElementsByClassName("J_wrapper")[0] as HTMLDivElement,
        oList = doc.getElementsByClassName("weui-panel__bd")[0] as HTMLDivElement,
        oLoading = doc.getElementsByClassName("loading_wrapper")[0] as HTMLDivElement;

    const init = async () => {
        tools.createHeader(oWrapper, "我丢失的物品");
        const data = await fetchData();
        if (!data) {
            return;
        }
        render(data);
    }

    const fetchData = async () => {
        try {
            const openid = "111";  // TODO: 获取openid
            const response = await fetch(`/api/laf/by-user?openid=${openid}&start=0&limit=10`);
            const {code, data} = await response.json();
            if (code != 10000) {
                tools.showAlert(doc, oWrapper, "获取数据失败，请稍后再试!", "error");
                return;
            }
            return data.items;
        } catch (e) {
            tools.showAlert(doc, oWrapper, "获取数据失败，请稍后再试!", "error");
        } finally {
            oLoading.style.display = "none";
            tools.hideAlert(doc);
        }
    }

    const render = (data: ILostAndFound[]) => {
        data.forEach(item => {
            const div = doc.createElement("div");
            div.innerHTML = `
                <h4 class="weui-media-box__title">${item.itemName}</h4>
                <p class="weui-media-box__desc">${item.description}</p>
           `;
            div.className = "weui-media-box weui-media-box_text";
            div.addEventListener("click", () => {
                win.location.href = `lost-and-found-detail.html?id=${item.id}&type=history`;
            });
            oList.appendChild(div);
        });
    }

    await init();
})(window, document, tools);