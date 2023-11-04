
/**
 * 
 * @swagger
 * paths:
 *  /mainpage/:nickname:
 *   get:
 *    summary: 즐겨찾는 아티스트 조회
 *    tags: [mainpage]
 *    parameters:
 *    - name: nickname
 *      in: query
 *      schema:
 *        type: string
 *    responses:
 *     200:
 *      description: 닉네임 조회 성공
 *      schema:
 *       properties:
 *        userId:
 *         type: integer
 *        artistId:
 *         type: integer
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
 *
 *
 *
 * @swagger
 * paths:
 *  /mainpage:
 *   get:
 *    summary: 실시간 도안 조회(5개)
 *    tags: [mainpage]
 *    responses:
 *     200:
 *      description: 정상처리
 *      schema:
 *       properties:
 *        userId:
 *         type: integer
 *        artistId:
 *         type: integer
 *        photo:
 *         type: string
 *        groupName:
 *         type: string
 *      schema:
 *       type: array
 *       items:
 *        properties:
 *          postId:
 *            type: integer
 *          photo:
 *            type: string
 *    
 *     401:
 *      description: 에러처리
 *      schema:
 *       properties:
 *        message:
 *         type: string
 */