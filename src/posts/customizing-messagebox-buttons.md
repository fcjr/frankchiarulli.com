---
author: 'Frank Chiarulli Jr.'
title: 'Customizing MessageBox Buttons'
date: '2021-03-19'
description: 'The MessageBox api provides a simple and convenient dialog boxes, but customization can be a little less straight forward.'
tags: ['windows', 'go', 'ui', 'winapi']
categories: ['windows', 'go', 'user-interfaces']
series: ['alert']
---

I recently started working on a simple 2fa client in go ([frothy](https://github.com/fcjr/frothy)) and had the need for simple confirmation dialogs with custom button titles. [NSAlert](https://developer.apple.com/documentation/appkit/nsalert) on macOS provides a simple mechanism for creating system dialogs with custom text and buttons titles. [MessageBox](https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-messagebox) on windows provides a similar api, however changing the button titles is a bit more complicated.

## <!--more-->

```go
// register hook to capture and set custom dialog button text
var hook user32.HHOOK
hook = user32.SetWindowsHookEx(user32.WH_CBT,
  (user32.HOOKPROC)(func(nCode int, wparam user32.WPARAM, lparam user32.LPARAM) user32.LRESULT {
    if nCode < 0 {
      return user32.CallNextHookEx(hook, nCode, wparam, lparam)
    }

    if nCode == user32.HCBT_ACTIVATE {
      // set custom button text
      user32.SetDlgItemText(wparam, user32.ID_BUT_YES, defaultButton)
      user32.SetDlgItemText(wparam, user32.ID_BUT_NO, alternateButton)
    }
    return user32.CallNextHookEx(hook, nCode, wparam, lparam)
  }), 0, (user32.DWORD)(windows.GetCurrentThreadId()))
defer user32.UnhookWindowsHookEx(hook)

var flags uint = user32.MB_ICONINFORMATION | user32.MB_YESNO | user32.MB_DEFBUTTON1
press, err := user32.MessageBoxW(user32.NULL, message, title, flags)
if err != nil {
  return false, err
}
return press == user32.ID_BUT_YES, nil
```

I've created a small library which provides this functionality which can be found here: [github.com/fcjr/alert](https://github.com/fcjr/alert).
