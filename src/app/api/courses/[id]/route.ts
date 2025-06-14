import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/lib/courseService';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const response = await CourseService.getCourseById(params.id);
    
    if (response.success) {
      return NextResponse.json({
        success: true,
        data: response.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: response.error
      }, { status: 404 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const body = await request.json();
    const response = await CourseService.updateCourse(params.id, body);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const response = await CourseService.deleteCourse(params.id);
    
    if (response.success) {
      return NextResponse.json({
        success: true
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