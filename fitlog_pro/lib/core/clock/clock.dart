abstract interface class AppClock {
  DateTime now();
}

final class SystemClock implements AppClock {
  const SystemClock();

  @override
  DateTime now() => DateTime.now().toUtc();
}

final class TestClock implements AppClock {
  DateTime _current;

  TestClock([DateTime? initial])
      : _current = initial ?? DateTime.utc(2026, 10, 21, 12, 0, 0);

  @override
  DateTime now() => _current;

  void advance(Duration duration) {
    _current = _current.add(duration);
  }

  void setTime(DateTime time) {
    _current = time.toUtc();
  }
}
