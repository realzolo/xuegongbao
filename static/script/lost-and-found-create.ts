(async (win, doc, tools) => {
    const oWrapper = doc.getElementById("J_wrapper") as HTMLDivElement,
        oInputs = oWrapper.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>,
        oImageList = doc.getElementById("J_image_list") as HTMLDivElement,
        oUploaderWrapper = doc.getElementById("J_uploader_wrapper") as HTMLDivElement,
        oUploader = oUploaderWrapper.getElementsByTagName("input")[0] as HTMLInputElement,
        oTextarea = doc.getElementById("J_textarea") as HTMLTextAreaElement,
        oSubmit = doc.getElementById("J_submit") as HTMLButtonElement;

    const imageList: string[] = [];

    const init = async () => {
        tools.createHeader(oWrapper, "发布失物招领信息");
        oTextarea.addEventListener("input", onTextareaInput, false);
        oSubmit.addEventListener("click", onSubmit, false);
        oUploader.addEventListener("change", onUploaderChange, false);
    }

    const onSubmit = async () => {
        // 1. 获取表单数据
        const formData: API.LostAndFound = getFormData()! as API.LostAndFound;
        if (!formData) return;

        // 2. 上传表单信息
        try {
            const response = await fetch("/api/laf/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({...formData, images: JSON.stringify(imageList)})
            });
            const {code} = await response.json();
            if (code != 10000) {
                tools.showAlert(oWrapper, "提交失败，请重试", false);
                return;
            }
            tools.showAlert(oWrapper, "提交成功", true);
            tools.disableButton(oSubmit);
        } catch (e) {
            tools.showAlert(oWrapper, "提交失败，请重试", false);
        } finally {
            tools.hideAlert()
        }
    }

    const onUploaderChange = async (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length == 0) {
            return;
        }
        const file = files[0];
        if (file.size > 1024 * 1024 * 5) {
            tools.showAlert(oWrapper, "图片大小不能超过5MB", false);
            tools.hideAlert();
            return;
        }
        let imgSrc = await imageUploader(file);
        if (!imgSrc) {
            return;
        }
        // 添加图片到图片列表
        imgSrc = "https://" + imgSrc;
        imageList.push(imgSrc);

        // 创建图片元素
        const li = doc.createElement("li");
        li.style.backgroundImage = `url(${trimQuotes(imgSrc)})`;
        li.className = "weui-uploader__file";
        oImageList.appendChild(li);

        if (oImageList.children.length >= 3) {
            oUploaderWrapper.remove();
        }
    }

    const getFormData = () => {
        const itemName = (oInputs.namedItem("itemName") as HTMLInputElement).value,
            location = (oInputs.namedItem("location") as HTMLInputElement).value,
            lostTime = (oInputs.namedItem("lostTime") as HTMLInputElement).value,
            description = oTextarea.value,
            stuName = (oInputs.namedItem("stuName") as HTMLInputElement).value,
            contact = (oInputs.namedItem("contact") as HTMLInputElement).value;

        const {isBlank} = tools;
        if (isBlank(itemName) || isBlank(description) || isBlank(contact)) {
            tools.showAlert(oWrapper, "请填写完整信息", false);
            tools.hideAlert();
            return;
        }

        const data: API.LostAndFound = {
            openid: tools.getOpenid(),
            itemName,
            location,
            description,
            lostTime,
            stuName,
            contact
        }
        return data;
    }

    // 上传图片
    const imageUploader = async (file: File) => {
        const formData = new FormData();
        formData.append("image", file);
        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })
            const {code, data} = await response.json();
            if (code != 10000) {
                tools.showAlert(oWrapper, "上传失败，请重试", false);
                return;
            }
            return data;
        } catch (e) {
            tools.showAlert(oWrapper, "上传失败，请重试", false);
        } finally {
            tools.hideAlert();
        }
    }

    const onTextareaInput = (e: Event) => {
        tools.computeWordCount(e);
    }

    // 删除字符串两边的引号
    const trimQuotes = (str: string) => {
        return str.replace(/^"(.*)"$/, "$1");
    }
    await init();
})(window, document, tools);