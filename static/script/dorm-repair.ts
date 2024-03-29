(() => {
    const {Vue, vant} = window;
    const {ref, onBeforeMount, watch} = Vue;
    const {Dialog, Toast} = vant;
    Vue.createApp({
        template: "#template",
        setup() {
            const state = {
                itemName: ref(""),
                description: ref(""),
                dorm: ref(""),
                room: ref(""),
                contactNumber: ref(""),
            }
            const loading = ref(false);
            const disabled = ref(false);

            onBeforeMount(() => {
                commonTools.createHeader("宿舍报修", {
                    text: "", fn: () => commonTools.router.back()
                });
            })
            watch(loading, () => {
                if (loading.value) {
                    Toast.loading({
                        message: "请稍后...",
                        forbidClick: true,
                        duration: 0
                    });
                } else {
                    Toast.clear();
                }
            })
            const onSubmit = () => {
                if (!commonTools.isActiveUser()) {
                    commonTools.showUserinfoSelector();
                    return;
                }
                loading.value = true;
                setTimeout(async () => {
                    const {code, data} = await commonTools.reqForPost("/api/dorm-repair/create", {
                        itemName: state.itemName.value,
                        description: state.description.value,
                        dorm: state.dorm.value,
                        room: state.room.value,
                        contactNumber: state.contactNumber.value,
                    });
                    if (code != 10000) {
                        Toast.fail("保存失败");
                        loading.value = false;
                        return;
                    }
                    loading.value = false;
                    Dialog.alert({
                        title: '成功',
                        message: '您的报修已提交成功，请等待工作人员为您处理!',
                        messageAlign: "left"
                    }).then(() => {
                        disabled.value = true;
                    });
                }, 1000);
            }

            return {
                state,
                onSubmit,
                disabled
            }
        }
    })
        .use(vant)
        .mount("#root");

})();