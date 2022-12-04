const { exec } = require('child_process');
const fs = require("fs");

function execScript(script, callback){
    exec(script, {'shell':'powershell.exe'}, (error, stdout, stderr)=> {
        // console.log(stdout);
        if(callback) callback(stdout);
    });
}

let getWindowListScript = `
Add-Type @"
  using System;
  using System.Text;
  using System.Runtime.InteropServices;
  public class Tricks {
    // declare the EnumWindowsProc delegate type
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
	
    [DllImport("user32.dll")]
    public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
	
	[DllImport("user32.DLL")]
	public static extern int GetWindowText(int hWnd, StringBuilder lpString, int nMaxCount);

	[DllImport("user32.DLL")]
	public static extern int GetWindowTextLength(int hWnd);

	[DllImport("user32.DLL")]
	public static extern bool IsWindowVisible(int hWnd);

  }
"@

chcp 65001

#$a = [tricks]::GetForegroundWindow()

$WindowHandles = [System.Collections.Generic.List[IntPtr]]::new()


# Define the callback function
$callback = {
  param([IntPtr]$handle, [IntPtr]$param) 
  
    if ([tricks]::IsWindowVisible($handle)){
        $WindowHandles.Add($handle);
    }
  # Copy the window handle to our list

  # Continue (return $false from the callback to abort the enumeration)
  return $true
}

if([tricks]::EnumWindows($callback, [IntPtr]::Zero)){
  echo ":start"
  foreach ($h in $WindowHandles) { 

    $length = [tricks]::GetWindowTextLength($h);
    
    if($length -eq 0){
        continue;
    }

    $builder = [System.Text.StringBuilder]::new($length);
    $result = [tricks]::GetWindowText($h, $builder, $length + 1);
    
    $r = $h.ToString() + ':-:' + $builder.ToString();
    echo $r;
  }
  echo ":end"
}
`
exports.getWindowList = 
    callback => execScript(getWindowListScript,r=>{
        let result = r.substring(r.indexOf(":start")+6, r.indexOf(":end"));
        callback(result);
    });

exports.setTopWindow = function(handle, reset){

    let script = `
Add-Type @"
    using System;
    using System.Text;
    using System.Runtime.InteropServices;
    
    public class Tricks {

        [DllImport("user32.DLL")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.DLL")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    }
"@

${reset==true? "[tricks]::ShowWindow("+handle+", 5);":""};
[tricks]::SetForegroundWindow(${handle});
`;

    execScript(script);
}

exports.getWindowRect = function(handle, callback){

    let script = `
Add-Type @"
    using System;
    using System.Text;
    using System.Runtime.InteropServices;
    
    public class Tricks {
    
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    }
    
    public struct RECT
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }
"@

$rc = New-Object RECT

$r = [tricks]::GetWindowRect(${handle}, [ref]$rc);
echo $rc.Left
echo $rc.Top
echo ($rc.Right - $rc.Left)
echo ($rc.Bottom - $rc.Top)
`;

    execScript(script, r=>{
        let vs = r.split("\r\n");
        // console.log(handle);
        // console.log(vs);
        
        callback({
            x:vs[0],
            y:vs[1],
            width:vs[2],
            height:vs[3],
        })
    });
}
