
/**
 * 
 * @swagger
 * tags:
 *  name: Mainpage
 *  description: 메인페이지 API
 * 
 * @swagger
 * paths:
 *  /mainpage/:nickname:
 *   get:
 *    summary: 즐겨찾는 아티스트 조회
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
 *
 * @swagger
 * paths:
 *  /mainpage:
 *   get:
 *    summary: 폴꾸 hot10
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