Array.prototype.contains = function(obj) { 
	var i = this.length; 
	while (i>=0) { 
		if (this[i] === obj) { 
			return true; 
		}
		i--; 
	} 
	return false; 
};

/*  
*　方法:Array.remove(v)  
*　功能:删除JavaScript数组元素.  
*　参数:值  
*　返回:在原JavaScript数组上修改JavaScript数组  
*/  
Array.prototype.remove=function(v)  {  
	for(var i=0;i<this.length;i++)  {  
		if(this[i] == v) {   
		   while(i<this.length){
			  if(i==this.length-1) {
				  this.length-=1;
				  break;
			  }
			  this[i] = this[i+1]
			  i++; 
		   }  
		   break;
		}  
	} 
};
/**
 * 时间类
 */
var timeUtil = {
	/**
	 *  @description  计算时间的间隔月
	 *  @param  begin_date  开始时间
	 *  @param  end_date    结束时间  
	 *  @retrun int
	 */
	date_diff_month:function(begin_date,end_date){
		var sTime,eTime;
		if(typeof(begin_date)=='undefined') {
			sTime = new Date();
		}
		else if(typeof(begin_date)=='string') {
			sTime = new Date(begin_date.replace(/\-/g, "/"));
		}else{
			sTime = begin_date;
		}
		if(typeof(end_date)=='undefined') {
			eTime = new Date();
		}
		else if(typeof(end_date)=='string') {
			eTime = new Date(end_date.replace(/\-/g, "/"));
		}else{
			eTime = end_date;
		}
		var diffmonth = (eTime.getFullYear()*12+eTime.getMonth()+1)-(sTime.getFullYear()*12+sTime.getMonth()+1);
		return diffmonth;	
	}
};

/**
 * 扩展方法: 时间格式化 
 */
Date.prototype.Format = function(fmt) {
  var o = {   
	"M+" : this.getMonth()+1,                    
	"d+" : this.getDate(),                   
	"h+" : this.getHours(),                  
	"m+" : this.getMinutes(),                 
	"s+" : this.getSeconds()              
  };   
  if(/(y+)/.test(fmt))   
	fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
	if(new RegExp("("+ k +")").test(fmt))   
		fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}; 


String.prototype.toInt = function(){
	return parseInt(this);
};
//字符串的长度，区分全角与半角
String.prototype.caseLength = function(){
	var self = this;
	var len = self.length;
	var caseLen = 0;
	for (var i = 0; i < len; i++)
	{
		if ((self.charCodeAt(i) & 0xff00) != 0){
			caseLen++;
		}
		caseLen++;
	}
	return caseLen;
};

// 截取字符串长度，一个全角字符算两个长度
String.prototype.caseSubStr = function(start, len){
	var self = this;
	var caseLen = 0;
	var l = 0;
	var tempLen = 0;
	var iStart = 0;
	var iLen = 0;
	for (var i = 0; i < self.length; i++){
		tempLen = 0;
		if ((self.charCodeAt(i) & 0xff00) != 0)
		{
			caseLen++;
			tempLen++;
		}
		caseLen++;
		tempLen++;
		if (caseLen >= start){
			if (iStart == null) iStart = i;
				l += tempLen;
				if (l >= len)
				{
					iLen = i - iStart + 1;
					break;
				}
			}
		}
	return this.substring(iStart, iLen);
}

//将字符串转换为float类型
String.prototype.toFloat = function(){
	return parseFloat(this);
};

//将日期字符串转换为日期类型，格式： 2010-11-5 16:00:00 
String.prototype.toDate = function(){
	var datePart = this.split(" ")[0];
	var temp = datePart.split("-");
	date = new Date(temp[0], temp[1] - 1, temp[2]);
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
};

//去掉字符串的前后空格
// 2011-04-27 jon update
// 将单个的replace方法拆分为 两次调用，可使每个正则表达式变得简单，因此更快
String.prototype.trim = function(){
	return this.replace(/^\s+/,"").replace(/\s+$/,"");
	/*
	return this.replace(/(^\s*)|(\s*$)/g, "");
	*/
}

// 应用于比较长的字符串清空空格

// 2011-04-27  jon  add
String.prototype.longTrim=function(){
	this.replace(/^\s+/,"");
	for(var i=this.length-1;i>=0;i--)
	{
	if(/\s/.test(this.charAt(i)))
	{
	this.substring(0,i+1);
	break;
	}
	}
	return this;
}

// 字符串StringBuilder类
function StringBuilder()
{
	this._strings = new Array();        
}
StringBuilder.prototype.Append= function(value)
{
	this._strings.push(value);
	return this;
}
StringBuilder.prototype.Clear = function()
{
	this._strings.length=1;
}
StringBuilder.prototype.toString = function()
{
	return this._strings.join('');
}
	
var arrayUtity = {
  slice:function(arr,startValue,endValue){
	  // 已有的数组中返回选定的元素
	  var startIndex = 0,
		  endIndex = arr.length-1;
	  if(startValue) {
		  for(var i = 0,len =arr.length;i<len;i++) {
			  if(arr[i]==startValue) {
				  startIndex = i;
				  break;
			  }
			  if(arr[i]==endValue) {
				  endIndex = i;
			  }
		  }
	  }
	  if(endValue) {
		  for(var i = 0,len =arr.length;i<len;i++) {
			  if(arr[i]==endValue) {
				  endIndex = i;
				  break;
			  }
		  }
	  }
	  if(startIndex>endIndex) {
		  startIndex = startIndex+endIndex;
		  endIndex = startIndex-endIndex;
		  startIndex = startIndex-endIndex;
	  }			
	  return arr.slice(startIndex,endIndex+1);
  }
};