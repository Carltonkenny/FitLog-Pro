import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fitlog_pro/main.dart';

void main() {
  testWidgets('FitLogApp initial launch renders AuthScreen gateway',
      (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: FitLogApp()));
    expect(find.text('FITLOG'), findsOneWidget);
    expect(find.text('PRO'), findsOneWidget);
    expect(find.text('Continue with Google'), findsOneWidget);
    expect(find.text('EMAIL ADDRESS'), findsOneWidget);
    expect(find.text('PASSWORD'), findsOneWidget);
  });

  testWidgets(
      'FitLogApp authenticated launch renders navigation shell and tabs',
      (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(
      child: FitLogApp(startAuthenticated: true),
    ));
    expect(find.text('FITLOG'), findsOneWidget);
    expect(find.text('PRO'), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Routines'), findsOneWidget);
    expect(find.text('History'), findsOneWidget);
    expect(find.text('Progress'), findsOneWidget);
    expect(find.text('Academy'), findsOneWidget);
  });
}
