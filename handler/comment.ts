import {Op} from "sequelize";
import {isDigit, isValidString, toValidDigit} from "../util/checker";
import {StatusCode, StatusMessage} from "../constant/status";
import {ADMIN_OPENID} from "../constant/common";
import {Handler, IComment} from "../types";
import CommonDAO from "../dao/common";
import {Comment} from "../dao/_init";
import model from "../dao/model";
import R from "../model/r";
import {getOpenidFromHeader} from "../util/openid";

/**
 * @tag user & admin
 * @description 添加一条留言 参数：{openid, content, parentId?}
 */
export const addCommentItem: Handler = async (req, res, next) => {
    const comment: IComment = req.body;
    if (!comment || !isValidString(comment.content)) {
        res.send(
            R.error(StatusCode.ILLEGAL_PARAM, StatusMessage.ILLEGAL_PARAM)
        );
        return;
    }
    const item = await CommonDAO.addOne(model.COMMENT, comment, getOpenidFromHeader(req));
    const r = item ? R.ok(null, StatusMessage.OK) : R.error(StatusCode.UNKNOWN_ERROR, StatusMessage.UNKNOWN_ERROR);
    res.send(r);
}

/**
 * @tag admin
 * @description 根据id删除一条留言 参数：{id}
 */
export const deleteCommentItemById: Handler = async (req, res) => {
    const {id} = req.body;
    if (!isDigit(id)) {
        return res.send(
            R.error(StatusCode.ILLEGAL_PARAM, StatusMessage.ILLEGAL_PARAM)
        );
    }
    await CommonDAO.delOne(model.COMMENT, toValidDigit(id));
    res.send(R.ok(null, StatusMessage.OK));
}

/**
 * @tag admin
 * @description 更新留言状态 未回复 -> 已回复 参数：{id}
 */
export const updateCommentStatusById: Handler = async (req, res) => {
    const {id} = req.body;
    if (!isDigit(id)) {
        return res.send(
            R.error(StatusCode.ILLEGAL_PARAM, StatusMessage.ILLEGAL_PARAM)
        );
    }
    await Comment.update({
        hasReply: 1
    }, {
        where: {
            id: id
        }
    })
    res.send(R.ok(null, StatusMessage.OK));
}

/**
 * @tag user
 * @description 根据用户查找留言列表,包含留言回复 参数：{openid, start, limit}
 */
export const findCommentsByUser: Handler = async (req, res) => {
    const {start, limit} = req.query;
    if (!isDigit(start) || !isDigit(limit)) {
        return res.send(
            R.error(StatusCode.ILLEGAL_PARAM, StatusMessage.ILLEGAL_PARAM)
        );
    }
    const openid = getOpenidFromHeader(req);
    const comments = await Comment.findAll({
        where: {
            [Op.and]: {
                isDeleted: 0,
                [Op.or]: [
                    {openid: openid},
                    {parentId: openid}
                ]
            }
        },
        offset: toValidDigit(start),
        limit: toValidDigit(limit),
        order: [
            ['id', 'DESC']
        ]
    });
    const data = {
        count: comments.length,
        items: comments
    }
    const r = comments ? R.ok(data, StatusMessage.OK) : R.error(StatusCode.UNKNOWN_ERROR, StatusMessage.UNKNOWN_ERROR);
    res.send(r);
}

/**
 * @tag user & admin
 * @description 根据id查找某条留言,包含回复留言 参数：{id}
 */
export const findCommentsById: Handler = async (req, res) => {
    const {id} = req.query;
    if (!isDigit(id)) {
        return res.send(
            R.error(StatusCode.ILLEGAL_PARAM, StatusMessage.ILLEGAL_PARAM)
        );
    }
    const comment = await Comment.findAll({
        where: {
            [Op.and]: {
                isDeleted: 0,
                [Op.or]: [
                    {id: toValidDigit(id)},
                    {parentId: toValidDigit(id)}
                ]
            }
        },
        order: [
            ['id', 'ASC']
        ]
    });
    const data = {
        count: comment.length,
        items: comment
    }
    const r = comment ? R.ok(data, StatusMessage.OK) : R.error(StatusCode.UNKNOWN_ERROR, StatusMessage.UNKNOWN_ERROR);
    res.send(r);
}

/**
 * @tag admin
 * @description 分页查找所有留言 参数：start, limit
 */
export const findAllComments: Handler = async (req, res) => {
    const {start, limit} = req.query;
    if (!isDigit(start) || !isDigit(limit)) {
        return res.send(
            R.error(StatusCode.ILLEGAL_PARAM, StatusMessage.ILLEGAL_PARAM)
        );
    }
    const {rows, count: total} = await Comment.findAndCountAll({
        where: {
            [Op.and]: [
                {
                    isDeleted: 0,
                    openid: {
                        [Op.ne]: ADMIN_OPENID
                    }
                }
            ]
        },
        offset: toValidDigit(start),
        limit: toValidDigit(limit),
        order: [
            ['id', 'DESC']
        ]
    })
    const data = {
        items: rows,
        count: rows?.length,
        total: total
    }
    const r = rows ? R.ok(data, StatusMessage.OK) : R.error(StatusCode.UNKNOWN_ERROR, StatusMessage.UNKNOWN_ERROR);
    res.send(r);
}