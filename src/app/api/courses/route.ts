import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/lib/courseService';

export async function GET() {
  try {
    const response = await CourseService.getAllCourses();
    
    if (response.success) {
      return NextResponse.json({
        success: true,
        data: response.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: response.error
      }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await CourseService.createCourse(body);
    
    if (response.success) {
      return NextResponse.json({
        success: true,
        data: response.data
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        error: response.error
      }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}