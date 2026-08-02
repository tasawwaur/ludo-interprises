export interface Point2D {
  x: number;
  y: number;
}

export class TokenAnimator {
  /**
   * Calculates a point along a quadratic Bezier curve.
   * p0: start point, p1: control point, p2: end point, t: progress (0 to 1)
   */
  public static getQuadraticBezierPoint(
    p0: Point2D,
    p1: Point2D,
    p2: Point2D,
    t: number
  ): Point2D {
    const oneMinusT = 1 - t;
    return {
      x: oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
      y: oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
    };
  }

  /**
   * Returns the mid-air control point for a token hop between two cells.
   * Lifts the token height vertically by a fraction of the cell size to simulate a jump.
   */
  public static getHopControlPoint(
    p0: Point2D,
    p2: Point2D,
    cellSize: number
  ): Point2D {
    return {
      x: (p0.x + p2.x) / 2,
      y: (p0.y + p2.y) / 2 - cellSize * 0.5, // 50% cell size lift
    };
  }
}
