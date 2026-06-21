import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

// Flutter's bundled localizations (flutter_localizations) don't include Kurdish
// (`ckb`). These delegates serve the **Arabic** Material/Cupertino/Widgets
// strings for ckb — both are RTL, Arabic-script — so built-in widgets (pickers,
// tooltips, text direction) work. Our own AppLocalizations still provides the
// real Kurdish strings from app_ckb.arb.

class _CkbMaterialDelegate extends LocalizationsDelegate<MaterialLocalizations> {
  const _CkbMaterialDelegate();
  @override
  bool isSupported(Locale locale) => locale.languageCode == 'ckb';
  @override
  Future<MaterialLocalizations> load(Locale locale) =>
      GlobalMaterialLocalizations.delegate.load(const Locale('ar'));
  @override
  bool shouldReload(_) => false;
}

class _CkbCupertinoDelegate extends LocalizationsDelegate<CupertinoLocalizations> {
  const _CkbCupertinoDelegate();
  @override
  bool isSupported(Locale locale) => locale.languageCode == 'ckb';
  @override
  Future<CupertinoLocalizations> load(Locale locale) =>
      GlobalCupertinoLocalizations.delegate.load(const Locale('ar'));
  @override
  bool shouldReload(_) => false;
}

class _CkbWidgetsDelegate extends LocalizationsDelegate<WidgetsLocalizations> {
  const _CkbWidgetsDelegate();
  @override
  bool isSupported(Locale locale) => locale.languageCode == 'ckb';
  @override
  Future<WidgetsLocalizations> load(Locale locale) =>
      GlobalWidgetsLocalizations.delegate.load(const Locale('ar'));
  @override
  bool shouldReload(_) => false;
}

/// Insert before the Global delegates so `ckb` resolves to the Arabic built-ins.
const ckbFallbackDelegates = <LocalizationsDelegate<dynamic>>[
  _CkbMaterialDelegate(),
  _CkbCupertinoDelegate(),
  _CkbWidgetsDelegate(),
];
