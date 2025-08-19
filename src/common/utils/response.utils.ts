export class ResponseUtils {
  static success(data: any, message = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }

  static paginated(data: any[], total: number, page: number, limit: number) {
    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
