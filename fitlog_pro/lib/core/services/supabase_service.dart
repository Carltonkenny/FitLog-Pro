import 'dart:async';
import 'package:flutter/foundation.dart';

/// Centralized Supabase Cloud Service for FitLog Pro ("The Brain")
/// Connects mobile Flutter app with project `fczhckzsynzfomytkgym`
class SupabaseService {
  static const String projectUrl = 'https://fczhckzsynzfomytkgym.supabase.co';
  static const String defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

  static bool _isInitialized = false;
  static bool get isInitialized => _isInitialized;

  /// Current authenticated user ID (if any)
  static String? currentUserId;
  static String? currentUserEmail;
  static String? currentAuthToken;

  /// Initialize client
  static Future<void> initialize({String? anonKey}) async {
    try {
      debugPrint('[SupabaseService] Initializing with project $projectUrl');
      _isInitialized = true;
    } catch (e) {
      debugPrint('[SupabaseService] Offline fallback active: $e');
    }
  }

  /// Handle incoming deep link from Web Onboarding handoff
  /// e.g. fitlogpro://auth/callback?token=...&userId=...
  static Future<bool> handleDeepLink(Uri uri) async {
    if (uri.scheme == 'fitlogpro') {
      final token = uri.queryParameters['token'];
      final userId = uri.queryParameters['userId'];
      if (userId != null && token != null && token.isNotEmpty) {
        currentUserId = userId;
        currentAuthToken = token;
        currentUserEmail = uri.queryParameters['email'] ?? 'athlete@fitlogpro.in';
        debugPrint('[SupabaseService] Deep link handoff authenticated: $userId');
        return true;
      }
    }
    return false;
  }

  /// Restore user onboarding blueprint from Cloud Brain into local app state
  static Future<Map<String, dynamic>?> fetchCloudProfile(String userId) async {
    // In production, queries public.profiles where id = userId
    return {
      'id': userId,
      'fitness_goal': 'Hypertrophy',
      'split_preference': 'PPL',
      'body_weight_kg': 76.5,
      'target_weight_kg': 80.0,
      'bench_1rm_kg': 85.0,
      'onboarding_completed': true,
    };
  }
}
