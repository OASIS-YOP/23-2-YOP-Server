import { query } from "express"
import { json } from "sequelize"

/**
 * @swagger
 * paths:
 *  /mainpage/:nickname:
 *   get:
 *    summary: 즐겨찾는 아티스트 조회
 *    parameters:
 *    - name: userId
 *      in: query
 *      schema:
 *        type: integer
 *    responses:
 *     200:
 *      description: 닉네임 조회 성공
 *      schema:
 *       properties:
 *        userId:
 *         type: string
 *        artistId:
 *         type: string
 *        photo:
 *         type: string
 *        groupName:
 *         type: string
 *     401:
 *      description: 닉네임 조회 실패
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *
 */