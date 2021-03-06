import {isDigit, isValidString, toValidDigit} from "../util/checker";
import {StatusCode, StatusMessage} from "../constant/status";
import {Handler, IPhoneBook} from "../types";
import CommonDAO from "../dao/common";
import model from "../dao/model";
import R from "../model/r";

/**
 * @tag admin
 * @description 新增联系人 参数: (deptName, phone)
 */
export const addPhoneItem: Handler = async (req, res) => {
    const phoneItem: IPhoneBook = req.body;
    if (!isValidString(phoneItem.deptName) || !isValidString(phoneItem.phone)) {
        return res.send(
            R.error(StatusCode.ILLEGAL_PARAM, StatusMessage.ILLEGAL_PARAM)
        );
    }
    const item = await CommonDAO.addOne(model.PHONE_BOOK, phoneItem);
    const r = item ? R.ok(item, StatusMessage.OK) : R.error(StatusCode.UNKNOWN_ERROR, StatusMessage.UNKNOWN_ERROR);
    res.send(r);
}

/**
 * @tag admin
 * @description 根据id删除联系人 参数: id
 */
export const deletePhoneItemById: Handler = async (req, res) => {
    const {id} = req.body;
    if (!isDigit(id) || id <= 0) {
        return res.send(
            R.error(StatusCode.ILLEGAL_PARAM, StatusMessage.ILLEGAL_PARAM)
        );
    }
    await CommonDAO.delOne(model.PHONE_BOOK, toValidDigit(id));
    res.send(R.ok(null, StatusMessage.OK));
}

/**
 * @tag user & admin
 * @description 分页查找联系人 参数: {start, limit}
 */
export const findAllPhoneItems: Handler = async (req, res) => {
    const {start, limit} = req.query;
    if (!isDigit(start) || !isDigit(limit)) {
        return res.send(
            R.error(StatusCode.ILLEGAL_PARAM, StatusMessage.ILLEGAL_PARAM)
        );
    }
    const {rows, count: total} = await CommonDAO.findSome(model.PHONE_BOOK, toValidDigit(start), toValidDigit(limit));
    const data = {
        items: rows,
        count: rows.length,
        total: total
    }
    const r = rows ? R.ok(data, StatusMessage.OK) : R.error(StatusCode.UNKNOWN_ERROR, StatusMessage.UNKNOWN_ERROR)
    res.send(r);
}
