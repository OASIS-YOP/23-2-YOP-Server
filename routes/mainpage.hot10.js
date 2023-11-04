/**
 * @swagger
 * paths:
 *  /mainpage:
 *   get:
 *    summary: 폴꾸 hot10
 *   parameter:
 * 
 *    responses:
 *     200:
 *      description: 정상처리
 *      schema:
 *       properties:
 *        userId:
 *         type: string
 *        artistId:
 *         type: string
 *        photo:
 *         type: string
 *        groupName:
 *         type: string,
 *        
 *     401:
 *      description: 에러처리
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *
 *
 */