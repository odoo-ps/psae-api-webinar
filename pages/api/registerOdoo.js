import Odoo from "../../external/odoo";

const FIELD_NAME = "x_phonebook_id";
const VIEW_NAME = "res.partner.form.phonebook.external"

export default async function handler(req, res) {
    const odoo = new Odoo({
        url: "http://127.0.0.1",
        port: 8069,
        db: "test_api",
        username: "admin",
        password: "admin",
    });

    const uid = await odoo.connect().catch(console.error);

    if (uid) {

        const shouldAddField = await odoo.execute_kw(
            "ir.model.fields",
            "search_count",
            [[[["name", "=", FIELD_NAME]]]],
        ).catch(console.error);

        if (!isNaN(shouldAddField) && !shouldAddField) {
            const partnerModelId = await odoo.execute_kw(
                "ir.model",
                "search",
                [[[["model", "=", "res.partner"]]]],
            ).catch(console.error);

            console.log("partnerModelId", partnerModelId);
            const inParams = [
                {
                    name: FIELD_NAME,
                    model_id: partnerModelId[0],
                    ttype: "integer",
                    state: "manual",
                    required: false
                },
            ];
            const params = [
                inParams,
            ];
            await odoo.execute_kw("ir.model.fields", "create", params).catch(console.error);
        }

        const shouldAddView = await odoo.execute_kw(
            "ir.ui.view",
            "search_count",
            [[[["name", "=", VIEW_NAME]]]],
        ).catch(console.error);

        if (!isNaN(shouldAddView) && !shouldAddView) {
            const partnerViewId = await odoo.execute_kw(
                "ir.ui.view",
                "search",
                [[[["name", "=", "res.partner.form"], ["inherit_id", "=", false]]]],
            ).catch(console.error);

            const inParams = [
                {
                    name: VIEW_NAME,
                    inherit_id: partnerViewId[0],
                    type: "form",
                    model: "res.partner",
                    arch_base: `
                        <xpath expr="//group/group" position="inside">
                            <field name="x_phonebook_id" string="External ID"/>
                        </xpath>
                    `
                },
            ];
            const params = [
                inParams,
            ];
            await odoo.execute_kw("ir.ui.view", "create", params).catch(console.error);
        }
    }

    res.status(200).json({message: "Done"});
}
