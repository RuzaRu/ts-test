import { Router } from 'express'
import testController from '../controller/test'

const router = Router()

router.get('/files', testController)

export default router
