import 'package:flutter/material.dart';
import '../../../../core/theme/tokens.dart';

class AuthScreen extends StatefulWidget {
  final Function(String email, String name) onAuthSuccess;

  const AuthScreen({
    super.key,
    required this.onAuthSuccess,
  });

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isSignUp = true;
  bool _obscurePassword = true;
  bool _isLoading = false;

  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController(text: 'Alex Miller');
  final _emailController = TextEditingController(text: 'alex.fit@example.com');
  final _passwordController = TextEditingController(text: 'Pass1234!');

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleGoogleSignIn() {
    setState(() => _isLoading = true);
    // Simulate instantaneous Google 1-Tap authentication token
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        setState(() => _isLoading = false);
        widget.onAuthSuccess(
          'alex.athlete@gmail.com',
          'Alex Athlete',
        );
      }
    });
  }

  void _handleSubmit() {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() => _isLoading = true);
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
          setState(() => _isLoading = false);
          widget.onAuthSuccess(
            _emailController.text.trim(),
            _isSignUp ? _nameController.text.trim() : 'Athlete',
          );
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FitLogTokens.bg,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Brand Header
                  const Center(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'FITLOG',
                          style: TextStyle(
                            fontSize: 30,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2.0,
                            color: FitLogTokens.textPrimary,
                          ),
                        ),
                        SizedBox(width: 8),
                        Text(
                          'PRO',
                          style: TextStyle(
                            fontSize: 30,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2.0,
                            color: FitLogTokens.accent,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Center(
                    child: Text(
                      'Evidence-Based Workout Tracker & AI Coach',
                      style: TextStyle(
                        fontSize: 13,
                        color: FitLogTokens.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Pill Features
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildPill('⚡ 0% Fluff'),
                      const SizedBox(width: 8),
                      _buildPill('🔬 Science Blueprint'),
                      const SizedBox(width: 8),
                      _buildPill('🤖 Gemini 2.5 Live'),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // 1-Tap Google Sign-In Button
                  InkWell(
                    onTap: _isLoading ? null : _handleGoogleSignIn,
                    borderRadius:
                        BorderRadius.circular(FitLogTokens.radiusCard),
                    child: Container(
                      height: 52,
                      decoration: BoxDecoration(
                        color: FitLogTokens.surface,
                        borderRadius:
                            BorderRadius.circular(FitLogTokens.radiusCard),
                        border: Border.all(color: Colors.white24, width: 1.2),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: const Text(
                              'G',
                              style: TextStyle(
                                color: Colors.blueAccent,
                                fontWeight: FontWeight.w900,
                                fontSize: 16,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Text(
                            'Continue with Google',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: FitLogTokens.textPrimary,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Divider
                  const Row(
                    children: [
                      Expanded(child: Divider(color: Colors.white12)),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'or continue with email',
                          style: TextStyle(
                            color: FitLogTokens.textSecondary,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      Expanded(child: Divider(color: Colors.white12)),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Name Field (Sign Up only)
                  if (_isSignUp) ...[
                    _buildTextFieldLabel('YOUR FULL NAME'),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _nameController,
                      style: const TextStyle(
                          color: FitLogTokens.textPrimary, fontSize: 14),
                      decoration: _buildInputDecoration(
                        hint: 'e.g. Alex Miller',
                        prefixIcon: Icons.person_outline,
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) {
                          return 'Please enter your name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Email Field
                  _buildTextFieldLabel('EMAIL ADDRESS'),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(
                        color: FitLogTokens.textPrimary, fontSize: 14),
                    decoration: _buildInputDecoration(
                      hint: 'name@example.com',
                      prefixIcon: Icons.email_outlined,
                    ),
                    validator: (val) {
                      if (val == null ||
                          !val.contains('@') ||
                          !val.contains('.')) {
                        return 'Please enter a valid email address';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 16),

                  // Password Field
                  _buildTextFieldLabel('PASSWORD'),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    style: const TextStyle(
                        color: FitLogTokens.textPrimary, fontSize: 14),
                    decoration: _buildInputDecoration(
                      hint: '••••••••',
                      prefixIcon: Icons.lock_outline,
                      suffix: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          color: FitLogTokens.textSecondary,
                          size: 18,
                        ),
                        onPressed: () => setState(
                            () => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                    validator: (val) {
                      if (val == null || val.length < 6) {
                        return 'Password must be at least 6 characters';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 24),

                  // Primary Action Button
                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _handleSubmit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: FitLogTokens.accent,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(FitLogTokens.radiusCard),
                        ),
                        elevation: 0,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                color: Colors.black,
                              ),
                            )
                          : Text(
                              _isSignUp
                                  ? 'Create Account & Build Plan'
                                  : 'Sign In to FitLog Pro',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.5,
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Mode Toggle
                  Center(
                    child: TextButton(
                      onPressed: () => setState(() => _isSignUp = !_isSignUp),
                      child: RichText(
                        text: TextSpan(
                          text: _isSignUp
                              ? 'Already have an account? '
                              : "Don't have an account? ",
                          style: const TextStyle(
                              color: FitLogTokens.textSecondary, fontSize: 13),
                          children: [
                            TextSpan(
                              text: _isSignUp ? 'Sign In' : 'Sign Up',
                              style: const TextStyle(
                                color: FitLogTokens.accent,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Legal compliance notice
                  const Center(
                    child: Text(
                      'By continuing, you agree to our Terms of Service & Privacy Policy per DPDPA guidelines.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.white38,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextFieldLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w800,
        letterSpacing: 1.0,
        color: FitLogTokens.textSecondary,
      ),
    );
  }

  InputDecoration _buildInputDecoration({
    required String hint,
    required IconData prefixIcon,
    Widget? suffix,
  }) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
      prefixIcon: Icon(prefixIcon, color: FitLogTokens.textSecondary, size: 18),
      suffixIcon: suffix,
      filled: true,
      fillColor: FitLogTokens.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        borderSide: const BorderSide(color: Colors.white12),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        borderSide: const BorderSide(color: Colors.white12),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        borderSide: const BorderSide(color: FitLogTokens.accent, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(FitLogTokens.radiusCard),
        borderSide: const BorderSide(color: FitLogTokens.danger, width: 1.5),
      ),
    );
  }

  Widget _buildPill(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: FitLogTokens.surface2,
        borderRadius: BorderRadius.circular(FitLogTokens.radiusPill),
        border: Border.all(color: Colors.white10),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: FitLogTokens.textSecondary,
        ),
      ),
    );
  }
}
