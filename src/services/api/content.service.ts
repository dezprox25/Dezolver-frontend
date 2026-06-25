import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type {
  Room,
  RoomVersion,
  Course,
  Problem,
  ProblemTestCase,
  ContentStatus,
  Difficulty,
  ProblemDifficulty,
  CreateRoomDto,
  UpdateRoomDto,
  CreateCourseDto,
  CreateProblemDto,
  AddTestCaseDto,
} from '@/types/content.types'

// ─── List params ──────────────────────────────────────────────────────────────

export interface ListRoomsParams {
  q?: string
  domain?: string
  difficulty?: Difficulty
  tags?: string
  status?: ContentStatus
  limit?: number
  cursor?: string
}

export interface ListCoursesParams {
  q?: string
  domain?: string
  difficulty?: Difficulty
  status?: ContentStatus
  limit?: number
  cursor?: string
}

export interface ListProblemsParams {
  q?: string
  difficulty?: ProblemDifficulty
  topics?: string
  companies?: string
  status?: ContentStatus
  limit?: number
  cursor?: string
}

export interface PaginatedContent<T> {
  items: T[]
  pagination: PaginationMeta
}

// ─── Content Service ──────────────────────────────────────────────────────────

export const contentService = {
  // ── Rooms ──────────────────────────────────────────────────────────────────

  async listRooms(params: ListRoomsParams = {}): Promise<PaginatedContent<Room>> {
    const res = await apiClient.get<ApiSuccess<Room[]>>('/rooms', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  async getRoom(slug: string): Promise<Room> {
    const res = await apiClient.get<ApiSuccess<Room>>(`/rooms/${encodeURIComponent(slug)}`)
    return res.data.data
  },

  async getRoomVersions(slug: string): Promise<RoomVersion[]> {
    const res = await apiClient.get<ApiSuccess<RoomVersion[]>>(
      `/rooms/${encodeURIComponent(slug)}/versions`
    )
    return res.data.data
  },

  async createRoom(dto: CreateRoomDto): Promise<Room> {
    const res = await apiClient.post<ApiSuccess<Room>>('/rooms', dto)
    return res.data.data
  },

  async updateRoom(id: string, dto: UpdateRoomDto): Promise<Room> {
    const res = await apiClient.patch<ApiSuccess<Room>>(
      `/rooms/${encodeURIComponent(id)}`,
      dto
    )
    return res.data.data
  },

  async submitRoomForReview(id: string): Promise<Room> {
    const res = await apiClient.post<ApiSuccess<Room>>(
      `/rooms/${encodeURIComponent(id)}/submit-for-review`
    )
    return res.data.data
  },

  async approveRoom(id: string): Promise<Room> {
    const res = await apiClient.post<ApiSuccess<Room>>(
      `/rooms/${encodeURIComponent(id)}/approve`
    )
    return res.data.data
  },

  async rollbackRoom(id: string, versionId: string): Promise<Room> {
    const res = await apiClient.post<ApiSuccess<Room>>(
      `/rooms/${encodeURIComponent(id)}/rollback/${encodeURIComponent(versionId)}`
    )
    return res.data.data
  },

  async archiveRoom(id: string): Promise<Room> {
    const res = await apiClient.post<ApiSuccess<Room>>(
      `/rooms/${encodeURIComponent(id)}/archive`
    )
    return res.data.data
  },

  // ── Courses ────────────────────────────────────────────────────────────────

  async listCourses(params: ListCoursesParams = {}): Promise<PaginatedContent<Course>> {
    const res = await apiClient.get<ApiSuccess<Course[]>>('/courses', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  async getCourse(slug: string): Promise<Course> {
    const res = await apiClient.get<ApiSuccess<Course>>(`/courses/${encodeURIComponent(slug)}`)
    return res.data.data
  },

  async createCourse(dto: CreateCourseDto): Promise<Course> {
    const res = await apiClient.post<ApiSuccess<Course>>('/courses', dto)
    return res.data.data
  },

  async addRoomToCourse(courseId: string, roomId: string, position?: number): Promise<Course> {
    const res = await apiClient.post<ApiSuccess<Course>>(
      `/courses/${encodeURIComponent(courseId)}/rooms`,
      { roomId, position }
    )
    return res.data.data
  },

  async removeRoomFromCourse(courseId: string, roomId: string): Promise<void> {
    await apiClient.delete(
      `/courses/${encodeURIComponent(courseId)}/rooms/${encodeURIComponent(roomId)}`
    )
  },

  // ── Problems ───────────────────────────────────────────────────────────────

  async listProblems(params: ListProblemsParams = {}): Promise<PaginatedContent<Problem>> {
    const res = await apiClient.get<ApiSuccess<Problem[]>>('/problems', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  async getProblem(slug: string): Promise<Problem> {
    const res = await apiClient.get<ApiSuccess<Problem>>(
      `/problems/${encodeURIComponent(slug)}`
    )
    return res.data.data
  },

  async createProblem(dto: CreateProblemDto): Promise<Problem> {
    const res = await apiClient.post<ApiSuccess<Problem>>('/problems', dto)
    return res.data.data
  },

  async addTestCase(problemId: string, dto: AddTestCaseDto): Promise<ProblemTestCase> {
    const res = await apiClient.post<ApiSuccess<ProblemTestCase>>(
      `/problems/${encodeURIComponent(problemId)}/test-cases`,
      dto
    )
    return res.data.data
  },

  async publishProblem(problemId: string): Promise<Problem> {
    const res = await apiClient.post<ApiSuccess<Problem>>(
      `/problems/${encodeURIComponent(problemId)}/publish`
    )
    return res.data.data
  },
}
